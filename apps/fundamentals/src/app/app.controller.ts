import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get(':id')
  getDataWithId(@Param('id') id: string) {
    return this.appService.getDataWithId(id);
  }

  @Post()
  postData(@Body() body: Record<string, unknown>) {
    return this.appService.postData(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.appService.update(id, body);
  }

  @Patch(':id')
  extend(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.appService.extend(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appService.remove(id)
  } 

}
