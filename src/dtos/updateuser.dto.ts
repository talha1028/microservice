import { PartialType } from '@nestjs/mapped-types';
import { createuserdto } from './user.dto';

export class updateuserdto extends PartialType(createuserdto) {}
