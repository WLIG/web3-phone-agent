import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { agent: true }
        })

        if (!user) {
          throw new Error("用户不存在")
        }

        // 使用bcrypt验证密码
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("密码错误")
        }

        if (user.status === "banned") {
          throw new Error("账号已被禁用")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agentId: user.agent?.id || null,
          agentLevel: user.agent?.level || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.agentId = user.agentId
        token.agentLevel = user.agentLevel
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.agentId = token.agentId as string | null
        session.user.agentLevel = token.agentLevel as number | null
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30天
  },
  secret: process.env.NEXTAUTH_SECRET
}
