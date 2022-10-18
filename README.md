# `%quorum` #

`%quorum` is a derivative of [`%sphinx`][sphinx] built primarily using [React],
[Typescript], and [Tailwind CSS]. [Vite] ensures that all code and assets are
loaded appropriately, bundles the application for distribution and provides a
functional dev environment.

## Development Instructions ##

Like many Urbit repositories, the project source code is split into two main
directories: `/desk` (for back-end Hoon code) and `/ui` (for front-end web
code). For development, creating a [fake `~zod`][fakezod] and deploying the
repo source to this ship's `/quorum` path is recommended. These paths are
referenced in subsequent workflows as follows:

```bash
$ export QUORUM_UI=/path/to/quorum/ui/
$ export QUORUM_DESK=/path/to/quorum/desk/
$ export FAKEZOD_DESK=/path/to/zod/quorum/
```

### First-time Setup ###

The following commands should be executed after each fresh clone of the project
to set up the development environment:

```bash
$ cd $QUORUM_UI
$ npm install
$ echo "VITE_SHIP_URL=http://127.0.0.1:8080" >> .env.local
```

Subsequently, run the following commands to create a new [fake `~zod`][fakezod]
and create a container desk `%quorum`:

```bash
$ cd $FAKEZOD_DESK/../../
$ urbit -F zod # -B urbit-v1.10.pill
> |merge %quorum our %base
> |mount %quorum
$ rm -rI $FAKEZOD_DESK/*
$ cd $QUORUM_DESK
$ rsync -uLrvP ./ $FAKEZOD_DESK/
> |commit %quorum
> |install our %quorum
```

### Development Workflows ###

#### Back-end Workflows ####

In order to test back-end code changes, run the following commands:

```bash
> |nuke %quorum-agent
$ cd $QUORUM_DESK
$ rsync -uLrvP ./ $FAKEZOD_DESK/
> |commit %quorum
> |install our %quorum
```

#### Front-end Workflows ####

In order to test front-end code changes, run the following commands
(these only need to be run once per development session; [Vite] hot swaps
assets when changes are saved):

```bash
$ cd $QUORUM_UI
$ npm run dev
```

Also, be sure to authenticate via both the NPM web portal (default:
`localhost:3000`) and the development ship's web portal ([fake `~zod`][fakezod]
default: `localhost:8080`).

### Deployment Workflow ###

In order to test the web package deployment process for the current
front-end build, run the following commands:

```bash
$ cd $QUORUM_UI
$ npm run build
$ rsync -avL --delete ./dist/ $FAKEZOD_DESK/quorum/
> |commit %quorum
> -garden!make-glob %quorum /quorum
$ cd $FAKEZOD_DESK/../.urb/put
$ sed -r "s/(glob-http\+\[).*(\])/\1\'http:\/\/127.0.0.1:8000\/$(ls | grep glob)\' $(ls | grep glob | sed -r 's/glob-(.*)\.glob/\1/g')\2/g" -i ../../quorum/desk.docket-0
$ python3 -m http.server 8000
> |commit %quorum
```


[sphinx]: https://github.com/arthyn/sphinx
[fakezod]: https://developers.urbit.org/guides/core/environment#development-ships
[react]: https://reactjs.org/
[typescript]: https://www.typescriptlang.org/
[tailwind css]: https://tailwindcss.com/
[vite]: https://vitejs.dev/
