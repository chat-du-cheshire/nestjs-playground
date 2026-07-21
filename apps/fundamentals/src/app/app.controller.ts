import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateDataDto, UpdateDataDto } from './data.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(@Query() query: Record<string, unknown>) {
    return this.appService.getData(query);
  }

  @Get(':id')
  getDataWithId(@Param('id') id: number) {
    console.log(typeof id)
    return this.appService.getDataWithId(id);
  }

  @Post()
  postData(@Body() body: CreateDataDto) {
    return this.appService.postData(body);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() body: UpdateDataDto) {
    return this.appService.update(id, body);
  }

  @Patch(':id')
  extend(@Param('id') id: number, @Body() body: UpdateDataDto) {
    return this.appService.extend(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.appService.remove(id)
  } 

}
