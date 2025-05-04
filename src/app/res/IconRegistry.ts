import {Injectable} from "@angular/core";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {iconBundles} from "./icons";

@Injectable({
      providedIn: "root",
})
export class IconRegistry {
      constructor(
              iconReg: MatIconRegistry,
              sanitizer: DomSanitizer
      ) {
            for (const icon of Object.values(iconBundles)) {
                  iconReg.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(`${icon}.svg`));
            }
      }
}