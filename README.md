# voxlis.NET

voxlist.NET is your go-to place for comparing exploits and cheats for Roblox and CS2.

The main site is [voxlis.net](https://voxlis.net), however [voxlis.com](https://voxlis.com) and [robloxhackers.lol](https://robloxhackers.lol) are also active and simply redirect to the main site.

## How do I add an executor?

1. Go to [voxlis.net/suggest](https://voxlis.net/suggest), and fill in the information there.
2. Copy the generated output and [create a new issue](/issues).

## Contributing

voxlis.NET uses the Sklair HTML compiler to make the entire site modular and easy to maintain. Installation instructions for Sklair are available [here](https://sklair.numelon.com).

To start working on the site, clone the repository:

```bash
git clone 'https://github.com/localscripts/localscripts.github.io.git' && cd localscripts.github.io'
```

And then you can instantly start a local development server, whose address will be printed out in the console:

```bash
sklair --debug serve
```

Please note that attempting to preview the HTML files in this repository regularly **WILL NOT WORK**, because the HTML files need to be compiled using Sklair first.

### JavaScript Definitions

Please see [js-definitions.js](./NOTES/js-definition.js) for more information about how cheats are "defined".

![image](https://github.com/user-attachments/assets/1b15f6ac-d16b-419e-b541-baaab9c98761)
