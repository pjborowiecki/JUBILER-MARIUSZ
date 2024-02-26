"use server"

import crypto from "crypto"

import { unstable_noStore as noStore } from "next/cache"
import { getUserByEmail, getUserByResetPasswordToken } from "@/actions/user"
import { signIn } from "@/auth"
import bcryptjs from "bcryptjs"
import { eq } from "drizzle-orm"
import { AuthError } from "next-auth"

import { env } from "@/env.mjs"
import { db } from "@/config/db"
import { resend } from "@/config/email"
import { psLinkOAuthAccount } from "@/db/prepared-statements/auth"
import { users } from "@/db/schema"
import {
  linkOAuthAccountSchema,
  passwordResetSchema,
  passwordUpdateSchemaExtended,
  signInWithPasswordSchema,
  signUpWithPasswordSchema,
  type LinkOAuthAccountInput,
  type PasswordResetFormInput,
  type PasswordUpdateFormInputExtended,
  type SignInWithPasswordFormInput,
  type SignUpWithPasswordFormInput,
} from "@/validations/auth"

import { EmailVerificationEmail } from "@/components/emails/email-verification-email"
import { ResetPasswordEmail } from "@/components/emails/reset-password-email"

export async function signUpWithPassword(
  rawInput: SignUpWithPasswordFormInput
): Promise<"invalid-input" | "exists" | "error" | "success"> {
  try {
    const validatedInput = signUpWithPasswordSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const user = await getUserByEmail({ email: validatedInput.data.email })
    if (user) return "exists"

    const passwordHash = await bcryptjs.hash(validatedInput.data.password, 10)
    const emailVerificationToken = crypto.randomBytes(32).toString("base64url")

    const newUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: validatedInput.data.email,
        passwordHash,
        emailVerificationToken,
      })
      .returning()

    const emailSent = await resend.emails.send({
      from: env.RESEND_EMAIL_FROM,
      to: [validatedInput.data.email],
      subject: "Weryfikacja adresu email",
      react: EmailVerificationEmail({
        email: validatedInput.data.email,
        emailVerificationToken,
      }),
    })

    return newUser && emailSent ? "success" : "error"
  } catch (error) {
    console.error(error)
    throw new Error("Error signing up with password")
  }
}

export async function signInWithPassword(
  rawInput: SignInWithPasswordFormInput
): Promise<
  | "invalid-input"
  | "invalid-credentials"
  | "not-registered"
  | "unverified-email"
  | "incorrect-provider"
  | "success"
> {
  try {
    const validatedInput = signInWithPasswordSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const existingUser = await getUserByEmail({
      email: validatedInput.data.email,
    })
    if (!existingUser) return "not-registered"

    if (!existingUser.email || !existingUser.passwordHash)
      return "incorrect-provider"

    if (!existingUser.emailVerified) return "unverified-email"

    await signIn("credentials", {
      email: validatedInput.data.email,
      password: validatedInput.data.password,
      redirect: false,
    })

    return "success"
  } catch (error) {
    console.error(error)
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "invalid-credentials"
        default:
          throw error
      }
    } else {
      throw new Error("Error signin in with password")
    }
  }
}

export async function resetPassword(
  rawInput: PasswordResetFormInput
): Promise<"invalid-input" | "not-found" | "error" | "success"> {
  try {
    const validatedInput = passwordResetSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const user = await getUserByEmail({ email: validatedInput.data.email })
    if (!user) return "not-found"

    const today = new Date()
    const resetPasswordToken = crypto.randomBytes(32).toString("base64url")
    const resetPasswordTokenExpiry = new Date(
      today.setDate(today.getDate() + 1)
    ) // 24 hours from now

    const userUpdated = await db
      .update(users)
      .set({
        resetPasswordToken,
        resetPasswordTokenExpiry,
      })
      .where(eq(users.id, user.id))
      .returning()

    const emailSent = await resend.emails.send({
      from: env.RESEND_EMAIL_FROM,
      to: [validatedInput.data.email],
      subject: "Resetowanie hasła",
      react: ResetPasswordEmail({
        email: validatedInput.data.email,
        resetPasswordToken,
      }),
    })

    return userUpdated && emailSent ? "success" : "error"
  } catch (error) {
    console.error(error)
    return "error"
  }
}

export async function updatePassword(
  rawInput: PasswordUpdateFormInputExtended
): Promise<"invalid-input" | "not-found" | "expired" | "error" | "success"> {
  try {
    const validatedInput = passwordUpdateSchemaExtended.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const user = await getUserByResetPasswordToken({
      token: validatedInput.data.resetPasswordToken,
    })
    if (!user) return "not-found"

    const resetPasswordExpiry = user.resetPasswordTokenExpiry
    if (!resetPasswordExpiry || resetPasswordExpiry < new Date())
      return "expired"

    const passwordHash = await bcryptjs.hash(validatedInput.data.password, 10)

    const userUpdated = await db
      .update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      })
      .where(eq(users.id, user.id))
      .returning()

    return userUpdated ? "success" : "error"
  } catch (error) {
    console.error(error)
    throw new Error("Error updating password")
  }
}

export async function linkOAuthAccount(
  rawInput: LinkOAuthAccountInput
): Promise<void> {
  try {
    const validatedInput = linkOAuthAccountSchema.safeParse(rawInput)
    if (!validatedInput.success) return

    noStore()
    await psLinkOAuthAccount.execute({ userId: validatedInput.data.userId })
  } catch (error) {
    console.error(error)
    throw new Error("Error linking OAuth account")
  }
}
