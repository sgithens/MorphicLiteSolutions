# Data structure for Morphic Bar

This is what the client will be expecting.

## `Bar`

```js
Bar = {
  // Bar identifier
  id: "bar1",
  // Bar name
  name: "Example bar",

  // Bar theme
  theme: {Theme},

  // Theme for bar items
  itemTheme: {Theme},

  // The bar items
  items: [
    {BarItem}
  ]
}
```

## `BarItem`
```js
BarItem = {
  // email|calendar|videocall|photos|...
  // Probably be ignored by the client
  category: "calendar",

  // unique identifier (probably ignored by client)
  id: "calendar-button",

  // Displayed on the button
  label: "Calendar",

  // Tooltip
  popupText: "Open the calendar",

  // More details. If this is specified, then `popupText` will become a header in the tooltip.
  description: "Displays your google calendar",

  // per-button theme, overrides the `theme.itemTheme` field from above.
  theme: {Theme},

  // `true` if it should be in the extra pull-out bar.
  isExtra: false,

  // `true` to not show this button. While it's expected that the client will only recieve the items which should be 
  // shown, this field provides the ability to show or hide items depending on the platform, using the platform
  // identifier, described later. For example, `hidden$win: true` will make the item only available for macOS.
  hidden: false,

  // The kind of item
  kind: "button",

  // The item data specific to the kind of item
  value: { }
}
```

### Item kinds

* `button`: A button
* `toggle`: on/off switch
* `image`: A logo (behaves like a button, but is just an image)


## `BarButton : BarItem`

```js
BarButton = {
  kind: "button",
  value: {
    // local/remote url of the icon
    icon: "calendar.png",

    // The action to perform when clicked.
    action: {Action}
  }
}
```

## `BarImage : BarItem`

```js
BarImage = {
  kind: "image",
  value: {
    // same as BarButton.value
  }
}
```

## `BarToggle : BarItem`

```js
BarToggle = {
  kind: "toggle",
  value: {
    // Set the preference
    preference: "gpii.readwrite.enabled",

    // If `preference` is undefined, then `state`, `on`, and `off` are used, which behave like buttons.

    // Detect the current state - will be a built-in function that returns a boolean, or command (exit 0 = 'on')
    state: {
      // Perhaps if `on.actionType` is `app`, this isn't required.
      action: {Action}
    },
    on: {
      text: "On", // default: "On",
      action: {Action}
    },
    off: {
      // Same structure as `on`.
    }
  }
}
```

## `Theme`

```js
Theme = {
  color: "white",
  background: "#002957"
}
```

## `Action`

```js
Action = {
  type: "app|link|...",
  data: "action data",
}
```

|`type`|`data`| |
|-|-|-|
|`app`|Path to the executable, and the arguments.|Starts an application, or activate a running instance|
|`shell`|Command string|Run a command (powershell on Windows)|
|`web`|The url|Open a website|
|`settings`|See https://ss64.com/nt/syntax-settings.html |Opens a page in the settings app (Windows).|
|`func:fname`|Something to pass to the function|Invokes a built-in function `fname`.|

### Built-in functions

For things that can't be described using the other action types.

|fname|Description|
|-|-|
|copy|Send ^C to the active application|
|paste|Send ^V to the active application|
|open-drawer|Displays the widgets in `extraWidgets`|

## Cross-platform

All fields in the above json can be suffixed with an OS identifier (`$mac` or `$win`), which will take precedence over the non-suffixed field. This pre-processing would be done on the client.

examples:

```JSON5
[
  {
    actionData: "default command",
    actionData$mac: "macOS command",

    popupText$win: "on windows",
    popupText: "not windows"
  },
  {
    actionData: "default command",
    actionData$win: "windows command"
  },
  {
    actionData: "default command (ignored)",
    actionData$win: "windows command",
    actionData$mac: "macOS command"
  },
]
```
