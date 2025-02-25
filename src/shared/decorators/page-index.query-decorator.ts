import { PageIndexPipe } from '@app/shared/pipes/page-index.pipe';
import { Query } from '@nestjs/common';

export const PageIndex = () => Query('pageIndex', PageIndexPipe);
