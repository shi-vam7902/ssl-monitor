import { User } from "../schemas/user.schema";

type UserT = User & { token: string };

export type RequestWithUser = Request & { user: UserT; userPermission: string };
