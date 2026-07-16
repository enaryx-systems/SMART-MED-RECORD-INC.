import { Body, Controller, Post } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  @Post("login") login(@Body() body: LoginDto) {
    return {
      accessToken: Buffer.from(`${body.email}:${body.role}`).toString(
        "base64url",
      ),
      user: {
        id: "usr_demo",
        name: body.email.split("@")[0].replace(/[._-]/g, " "),
        email: body.email,
        role: body.role,
        firm: "Hamilton & Pierce LLP",
      },
    };
  }
}
