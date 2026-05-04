import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({ where: { email: dto.email } });
    if (existing) {
      // Mensagem genérica — não confirma se o e-mail existe ou não
      throw new ConflictException('Não foi possível concluir o cadastro');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    return this.userModel.create({ ...dto, password: hashed } as any);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException('Não foi possível atualizar o e-mail');
      }
    }

    // Atualiza APENAS os campos permitidos pelo DTO — nunca o id, emergencyFund, etc.
    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.password !== undefined) {
      updateData.password = await bcrypt.hash(dto.password, 12);
    }

    return user.update(updateData);
  }
}
