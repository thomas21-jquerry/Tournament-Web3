import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto } from './dto/auth.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const { siweMessage, signature } = signInDto;

    const result = await this.userService.signIn(siweMessage, signature);

    return result;
  }
}