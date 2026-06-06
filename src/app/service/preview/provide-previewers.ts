import {Provider} from "@angular/core";
import {PREVIEWER} from "./previewer";
import {TextPreviewer} from "./text-previewer";
import {ImagePreviewer} from "./image-previewer";
import {IconPreviewer} from "./icon-previewer";
import {PreferencePreviewer} from "./preference-previewer";
import {GroupPreviewer} from "./group-previewer";
import {FilePreviewer} from "./file-previewer";

export function providePreviewers(): Provider[] {
    return [
        {provide: PREVIEWER, useClass: TextPreviewer, multi: true},
        {provide: PREVIEWER, useClass: ImagePreviewer, multi: true},
        {provide: PREVIEWER, useClass: IconPreviewer, multi: true},
        {provide: PREVIEWER, useClass: PreferencePreviewer, multi: true},
        {provide: PREVIEWER, useClass: GroupPreviewer, multi: true},
        {provide: PREVIEWER, useClass: FilePreviewer, multi: true},
    ];
}
