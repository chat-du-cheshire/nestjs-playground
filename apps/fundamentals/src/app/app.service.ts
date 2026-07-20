import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDataDto, IData, UpdateDataDto } from './data.dto';

@Injectable()
export class AppService {
  private data: IData[] = [
    {id: 1, name: 'Foo'}, 
    {id: 2, name: 'Bar'}
  ]


  getData(query: Record<string, unknown>): IData[] {
    const {name = ''} = query;
    return this.data.filter(i => i.name.includes(name as string));
  }

  getDataWithId(id: number): IData {
    const item = this.data.find(i => i.id === id);

    if (!item) {
      throw new NotFoundException(`Item with id: ${id} not found`)
    }

    return item;
  }

  postData(body: CreateDataDto): IData {

    const item = {...body, id: Math.max(...this.data.map(i => i.id)) + 1}

    this.data.push(item)

    return item;
  }

  update(id: number, body: UpdateDataDto): IData {
    this.data = this.data.map((v) => v.id === id ? {...v, ...body}: v);

    const item = this.data.find(v => v.id === id);
    

    if (!item) {
      throw new NotFoundException(`Item with id: ${id} not found`)
    }


    return item;
  }

  extend(id: number, body: UpdateDataDto): IData {
    
    this.data = this.data.map((v) => v.id === id ? {...v, ...body}: v);
    const item = this.data.find(v => v.id === id) ?? null;
    

    if (!item) {
      throw new NotFoundException(`Item with id: ${id} not found`)
    }


    return item;
  }

  remove(id: number): IData {
    const item = this.data.find(v => v.id === id) ?? null;


    if (!item) {
      throw new NotFoundException(`Item with id: ${id} not found`)
    }


    this.data = this.data.filter(i => i.id !== id);
    
    return item;
  }
}
