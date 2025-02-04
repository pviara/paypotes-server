import { Body } from '@nestjs/common';
import { CreateGroupValidationPipe } from '@groups/presentation/pipes/create-group.validation-pipe';

export const GroupDTO: () => ParameterDecorator = () =>
    Body(CreateGroupValidationPipe);
