import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia().post(
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
  }
);
