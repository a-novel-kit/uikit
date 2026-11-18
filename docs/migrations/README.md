# Migration guides

Consumer changes required by UIKit releases are documented here, newest first.

- [v0.26.0](./v0.26.0.md): Text lands on whole pixels: each line height token rounds its element's line box to an even pixel count, and uikit's components set a line height wherever they set a font size, so a screenshot no longer moves a text one pixel on a sub-pixel layout difference.
- [v0.25.0](./v0.25.0.md): uikit drops the components that duplicated another part of the system, the tokens nothing read and the empty icons package, states its browser baseline (Baseline widely available), and ships the parts every platform copied: access and page states with their copy, the shell's geometry, the root canvas styles and the fixed Storybook controllers.
- [v0.20.0](./v0.20.0.md): Form and dialog actions follow one rule, Studio's lamp turns magenta, the file input turns compact, and uikit gains a tag input, a chip group and a language name.
- [v0.12.0](./v0.12.0.md): Install the images from ui-images
- [v0.10.0](./v0.10.0.md): Import banners by height
- [v0.9.0](./v0.9.0.md): Name identifiers after A-Novel
- [v0.3.0](./v0.3.0.md): Move component state into controllers
