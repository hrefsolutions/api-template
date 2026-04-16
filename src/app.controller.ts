import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class AppController {
  constructor() {}

  @Get()
  async helloWorld(){
    return "<b>OK</b>";
  }
}