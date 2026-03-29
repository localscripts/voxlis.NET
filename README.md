# voxlis.NET

voxlist.NET is your go-to source for comparing exploits and cheats for Roblox and CS2.

The main site is [voxlis.net](https://voxlis.net), however [voxlis.com](https://voxlis.com) and [robloxhackers.lol](https://robloxhackers.lol) are also active and simply redirect to the main site.

> [!IMPORTANT]  
> Please see the ["License and usage notice"](#license-and-usage-notice) section for more information about Voxlis data.

<!-- ## How do I add an executor?

1. Go to [voxlis.net/suggest](https://voxlis.net/suggest), and fill in the information there.
2. Copy the generated output and [create a new issue](/issues). -->

## Contributing

voxlis.NET uses the Sklair HTML compiler/build system to make the entire site modular and easy to maintain. Installation instructions for Sklair are available [here](https://sklair.numelon.com/download).

To start working on the site, clone the repository:

```bash
git clone "https://github.com/localscripts/voxlis.NET" && cd "voxlis.NET"
```

And then you can instantly start a local development server, whose address will be printed out in the console at the start:

```bash
sklair --debug serve
```

Please note that attempting to preview the HTML files in this repository regularly **WILL NOT WORK**, because the HTML files need to be compiled using [Sklair](https://sklair.numelon.com) first.

### Adding new cheats

**If you wish to add an exploit/cheat, then do not modify any files other than the ones in `data/roblox`.**

> [!WARNING]  
> All present and new data inside the `data/roblox` directory must conform to the schemas defined in `data/schemas/roblox`. It is therefore ***heavily advisable*** that you make any modifications to this repository using [Visual Studio Code](https://code.visualstudio.com/), as it has support for JSON document editing according to a schema.
>
> **THE SITE WILL NOT COMPILE AT ALL, ON PURPOSE, IF ANY DATA DOES NOT CONFORM WITH THE SCHEMA.**
> This is to ensure that all data is organised well and it does not become a rats nest like this repository once was.

1. Navigate to the `data/roblox` folder.
2. Create a new folder there, named after the cheat you want to add.
   - E.g. `Some Executor`, so now you have this: `data/roblox/Some Executor`. Don't worry, spaces inside the folder name are fine!
3. Create `info.json` inside of this new folder. This is the most important step.
   - It is crucial that you use VSCode to write this file, as otherwise you will not have autocompletion. VScode will help you fill in the required fields according to the cheat information schema.
4. Next, create `review.md`. This is important too, as the site will refuse to compile when a cheat does not have a review written. For initial submissions, it is fine to have this file filled with notes or other information that you have, since it will be checked anyway and very likely modified before your pull request is merged.
5. (Optional) Create `points.json`. This is a simple JSON file with the keys `pro_summary`, `neutral_summary`, and `con_summary`. As the names imply, these are very short summaries to be put on each cheat card on the front page. It is recommended to keep these summaries under 50 characters so that people can quickly scan over this information. For anything longer, that is what `review.md` was designed for.

## License and usage notice

> [!WARNING]  
> This repository is source-available, but **not fully open-source**.

All source code, data, content, reviews, points, prices, and related materials are proprietary and protected.

You may view this repository for transparency purposes only.
You may **not** copy, extract, reuse, redistribute, or create derivative works from any part of this repository without explicit prior written permission from Voxlis.

This license **supersedes** any prior licensing (including the MIT License) from commit [`84eaaa5f09761169ff6e0fa71d9de0913b2321fc`](https://github.com/localscripts/voxlis.NET/commit/84eaaa5f09761169ff6e0fa71d9de0913b2321fc) onward.

See the [`LICENSE`](./LICENSE) file for full terms.
