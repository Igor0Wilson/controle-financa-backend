import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
    }>;
    me(req: any): Promise<{
        id: string;
        name: string;
        email: string;
    }>;
    updateProfile(req: any, dto: any): Promise<{
        id: string;
        name: string;
        email: string;
    }>;
}
