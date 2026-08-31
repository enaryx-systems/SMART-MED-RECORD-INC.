import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { AuthUser } from "../../common/auth/auth-user";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
