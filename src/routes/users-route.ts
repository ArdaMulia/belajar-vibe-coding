import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .derive(({ headers }) => {
    const authHeader = headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return {
        token: authHeader.split(" ")[1],
      };
    }
    return {
      token: null,
    };
  })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await UsersService.register(body);
        return { data: "OK" };
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400; // Bad Request atau 409 Conflict
        } else {
          set.status = 500;
        }
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String(),
        password: t.String({ minLength: 4 }),
      }),
    },
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await UsersService.login(body);
        return { data: token };
      } catch (error: any) {
        set.status = 401; // Unauthorized
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    },
  )
  .get("/current", async ({ token, set }) => {
    try {
      if (!token) {
        throw new Error("Unauthorized");
      }

      const user = await UsersService.getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })
  .delete("/logout", async ({ token, set }) => {
    try {
      if (!token) {
        throw new Error("Unauthorized");
      }

      await UsersService.logout(token);
      return { data: "Ok" };
    } catch (error: any) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
