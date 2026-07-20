import {IsString} from 'class-validator'
import {PartialType} from '@nestjs/mapped-types'


export interface IData {
  id: number,
  name: string
}

export class CreateDataDto implements Omit<IData, 'id'> {
    @IsString()
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export class UpdateDataDto extends PartialType(CreateDataDto) {}