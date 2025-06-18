import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // OneLogin OIDC Provider for Production
    ...(process.env.ONELOGIN_CLIENT_ID
      ? [
          {
            id: "onelogin",
            name: "OneLogin",
            type: "oauth" as const,
            wellKnown: `${process.env.ONELOGIN_ISSUER}/.well-known/openid_configuration`,
            clientId: process.env.ONELOGIN_CLIENT_ID,
            clientSecret: process.env.ONELOGIN_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "openid profile email",
              },
            },
            idToken: true,
            checks: ["pkce", "state"],
            profile(profile) {
              return {
                id: profile.sub,
                name:
                  profile.name ||
                  `${profile.given_name} ${profile.family_name}`,
                email: profile.email,
                image: profile.picture,
              };
            },
          },
        ]
      : []),

    // Credentials Provider (Development/Fallback)
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            name: "Credentials",
            credentials: {
              email: { label: "Email", type: "text" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null;
              }

              const user = await prisma.user.findUnique({
                where: { email: credentials.email },
              });

              if (!user) {
                return null;
              }

              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              );

              if (!isPasswordValid) {
                return null;
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name,
              };
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours for production
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // Store provider info for JIT user creation
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Just-In-Time User Creation for OneLogin
      if (account?.provider === "onelogin" && user.email) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user from OneLogin profile
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split("@")[0],
                password: "ONELOGIN_SSO", // Placeholder password
              },
            });
            console.log(`✅ JIT: Created new user for ${user.email}`);
          }

          return true;
        } catch (error) {
          console.error("JIT User Creation Error:", error);
          return false;
        }
      }

      return true;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        console.log(
          `🎉 New user signed in: ${user.email} via ${account?.provider}`
        );
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
