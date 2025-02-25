import { Query } from '@nestjs/common';
import { SearchPipe } from '@app/shared/pipes/search.pipe.ts';

export const Search = () => Query('search', SearchPipe);
