import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../../common/auth/jwt.strategy";
import { CreateMessageDto } from "../cases/dto/create-message.dto";
import { MessagesService } from "./messages.service";

@ApiTags("messages")
@Controller("cases/:caseId/messages")
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(@Param("caseId") caseId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.messages.list(caseId, user);
  }

  @Post()
  create(
    @Param("caseId") caseId: string,
    @Body() body: CreateMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messages.create(caseId, body, user);
  }
}
