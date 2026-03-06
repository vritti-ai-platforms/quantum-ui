import { CHECK_LIST, ELEMENT_TRANSFORMERS, MULTILINE_ELEMENT_TRANSFORMERS, TEXT_FORMAT_TRANSFORMERS, TEXT_MATCH_TRANSFORMERS } from "@lexical/markdown"

import { EMOJI } from "./markdown-emoji-transformer"
import { HR } from "./markdown-hr-transformer"
import { IMAGE } from "./markdown-image-transformer"
import { TABLE } from "./markdown-table-transformer"
import { TWEET } from "./markdown-tweet-transformer"

export const ALL_TRANSFORMERS = [
  TABLE,
  HR,
  IMAGE,
  EMOJI,
  TWEET,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]



