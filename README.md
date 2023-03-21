# `%quorum` #

`%quorum` is a choral explanations application for [Urbit] which enables
users to host and join question-and-answer boards on the [Urbit] network. The
application is implemented with a standard [Gall agent][urbit-agent] back-end
and a [React]/[Tailwind CSS] front-end.

## Demo ##

![%quorum demo](https://github.com/sidnym-ladrut/quorum/raw/main/dat/quorum-demo.gif)

## Install ##

### Grid GUI (Recommended) ###

Within your Urbit ship's web interface, navigate to the home screen
(i.e. `/apps/grid/`) and do the following:

1. In the search bar, type in: `~dister-dister-sidnym-ladrut`.
1. Click on `~sidnym^ladrut`.
   ![img](https://github.com/sidnym-ladrut/quorum/raw/main/dat/install-1.png)
1. Under apps distributed by `~sidnym^ladrut`, click on 'Quorum.'
   ![img](https://github.com/sidnym-ladrut/quorum/raw/main/dat/install-2.png)
1. Press the 'Get App' button. After installation, the app tile should appear.

### Dojo CLI ###

Within your Urbit ship's command-line interface, enter the following command(s):

```bash
> |install ~dister-dister-sidnym-ladrut %quorum
```

## Build/Develop ##

For development, we recommend creating a [fake `~zod`][fakezod] and deploying
the repo's `/desk` subdirectory to this ship's `%quorum` desk. We reference the
following paths in the workflows below:

```bash
$ export QUORUM_UI=/path/to/quorum/ui/
$ export QUORUM_DESK=/path/to/quorum/desk/
$ export FAKEZOD_DESK=/path/to/zod/quorum/
```

### First-time Setup ###

The following commands should be executed after each fresh clone of the project
to set up the [Vite] and the UI development environment:

```bash
$ cd $QUORUM_UI
$ npm install
$ echo "VITE_SHIP_URL=http://127.0.0.1:8080" >> .env.local
```

Subsequently, run the following commands to create a new [fake `~zod`][fakezod]
and create a container desk `%quorum`:

```bash
$ cd $FAKEZOD_DESK/../../
$ urbit -F zod
> |new-desk %quorum
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
> |revive %quorum
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


[urbit]: https://urbit.org
[urbit-agent]: https://developers.urbit.org/reference/glossary/agent
[fakezod]: https://developers.urbit.org/guides/core/environment#development-ships
[react]: https://reactjs.org/
[tailwind css]: https://tailwindcss.com/
[vite]: https://vitejs.dev/
