import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsIn(['attorney', 'case-manager', 'physician', 'reviewer', 'billing', 'admin']) role!: string;
}

@Controller('auth')
export class AuthController {
  @Post('login') login(@Body() body: LoginDto) {
    return {
      accessToken: Buffer.from(`${body.email}:${body.role}`).toString('base64url'),
      user: { id: 'usr_demo', name: body.email.split('@')[0].replace(/[._-]/g, ' '), email: body.email, role: body.role, firm: 'Hamilton & Pierce LLP' },
    };
  }
}
