import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './login.dto.js';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('auth/login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(AdminGuard)
  @Get('admin/me')
  me(@Req() req: { admin: { email: string } }) {
    return { email: req.admin.email };
  }
}