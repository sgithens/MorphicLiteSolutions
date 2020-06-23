The solutions registry is written and maintained in [YAML](https://yaml.org) with the expectation that it will be human-edited.

The YAML source can be translated into JSON for packaging with clients.

Top Level
=========

At the root level of the solutions registry is a dictionary with the following
properties:

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>solutions</code></th>
            <td><code>Solution[]</code></td>
            <td>The list of solutions</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

Solution
========

Each solution represents an accessibility technology that has a collection of
settings.  The solution objects have the following properties:

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>id</code></th>
            <td><code>string</code></td>
            <td>A reverse-domain identifier</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>settings</code></th>
            <td><code>Setting[]</code></td>
            <td>A list of settings relevant to this solution</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

Setting
=======

Each setting representns a specific option that affects how a solution behaves.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>name</code></th>
            <td><code>string</code></td>
            <td>A locally-unique name within the solution</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>type</code></th>
            <td><code>Type</code></td>
            <td>The type of value for this setting</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>default</code></th>
            <td><code>any</code></td>
            <td>The default value for this setting</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>handler</code></th>
            <td><code>Handler</code></td>
            <td>Details of how to read and write the setting</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>finalizer</code></th>
            <td><code>Finalizer</code></td>
            <td>Extra operation that needs to run so the changed setting is seen</td>
            <td>Optional</td>
        </tr>
        <tr>
            <th><code>dependencies</code></th>
            <th><code>string[]</code></th>
            <td>A list of setting names that must be applied before this one</td>
            <td>Optional</td>
        </tr>
    </tbody>
</table>

Type : string
-----

* `string`
* `integer`
* `double`
* `boolean`
* `files`

Dependencies
-----

The names in the dependency list can be either other setting names from the
same solution or fully qualified names in the form `<solution.id>.<setting.name>`.

Handlers
=======

A handler must be one of the following concrete handler

Client Handler
-----

Client handlers expect the client to have special code for handling the setting.

Because of the custom nature of these settings, client handlers do not contain
any extra information.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"org.raisingthefloor.morphic.client"</code></td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

Each specific client handler defines the value types it reads and writes.

Windows Registry Handler
-----

Windows registry handlers adjust values within the windows regsitry based on
the properties below:

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.registry"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>key_name</code></th>
            <td><code>string</code></td>
            <td>The full key of the registry entry</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>value_name</code></th>
            <td><code>string</code></td>
            <td>The name of the value to change within the registry key</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>value_type</code></th>
            <td><code>RegistryType</code></td>
            <td>The type of registry value</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

### RegistryType: string

* `string` - String
* `expandString` - String that expands environmental variables when reading
* `dword` - 32 bit integer
* `qword` - 64 bit ingeger

### Compatible Types

A registry handler is compatible with the following setting types:

* `string` -> registry type `string` or `expandString`
* `boolean` -> registry type `dword`
* `integer` -> registry type `dword` or `qword`

Windows System Setting Handler
-----

Windows system setting handlers call built in windows function to adjust
settings after inspecting a special registry key for information about
how to find the function for each setting.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.system"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>setting_id</code></th>
            <td><code>string</code></td>
            <td>The subkey under HLM\SW\MS\SystemSettings\SettingId</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>value_type</code></th>
            <td><code>SystemType</code></td>
            <td>The type of value expected by the system</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>integer_map</code></th>
            <td><code>string[]</code></td>
            <td>A mapping of integer value to strings, required when the setting <code>type</code> is <code>integer</code> and the handler <code>value_tupe</code> is <code>string</code></td>
            <td>Optional</td>
        </tr>
    </tbody>
</table>

### SystemType: string

* `string`
* `boolean`
* `integer`
* `idPrefixedEnum` - A string value in the `"$(setting_id)$(intvalue)"` format

### Compatible Types

A system setting handler is compatible with the following setting types:

* `string` -> system type `string`
* `boolean` -> system type `boolean`
* `integer` -> system type `integer` or `string` or `idPrefixedEnum`

Windows INI File Handler
-----

Windows INI file handlers adjust values within `.ini` files.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.ini"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>filename</code></th>
            <td><code>string</code></td>
            <td>The absolute path of the file</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>section</code></th>
            <td><code>string</code></td>
            <td>The section within the ini file</td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>key</code></th>
            <td><code>string</code></td>
            <td>The key within the section</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

### Filename Environmental Variables

Environmental variables can be used in the `filename` of an ini handler using
the `$(VARNAME)` syntax.

The following variables are supported:

* `APPDATA` - The user's application data root folder

### Compatible Types

A ini setting handler is compatible with the following setting types:

* `string` -> ini string
* `boolean` -> ini string `"0"` or `"1"`
* `integer` -> ini string representation (e.g., `"42"`)
* `double` -> ini string representation (e.g, `"4.2"`)


Files Handler
-----

Files handlers can be used to capture and apply the full configuration files used by 
a solution.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.files"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>root</code></th>
            <td><code>string</code></td>
            <td>A common absolute root path for the <code>files</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>files</code></th>
            <td><code>string[]</code></td>
            <td>The files to collect</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

### Filename Environmental Variables

Environmental variables can be used in the `root` of a files handler using
the `$(VARNAME)` syntax.

The following variables are supported:

* `APPDATA` - The user's application data root folder


### File Wildcards

An entry in the `files` array may contain a leading or a trailing wildcard in the
final path component.

````
solutions:
  -
    # ...
    settings:
      -
        # ...
        handler:
          type: com.microsoft.windows.files
          root: $(APPDATA)\MyApp
          files:
            - config/*.ini
            - extra/pref*
            - more/*
````

### Compatible Types

A files setting handle supports only the `files` setting type.


Process Handler
-----

Process handlers can be used to capture a `boolean` of whether a given
process is running or installed

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.process"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>exe</code></th>
            <td><code>string</code></td>
            <td>The executable name, often a registry subkey within <code>HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>state</code></th>
            <td><code>ProcessState</code></td>
            <td>Which state of the process should be captured/applied</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>

### Compatible Types

A process running setting handle supports only the `boolean` setting type.

### ProcessState: string

* `running` - Whether the process is running
* `installed` - Whether the process is installed (currently capture only)

Finalizers
=======

A finalizer must be one of the following concrete finalizers

System Parameters Info Finalizer
-----

System Parameteres Info finalizers call the `SystemParameteresInfoW` function
on windows, which can be used to refresh certain services.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.systemParametersInfo"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>action</code></th>
            <td><code>SystemParameterAction</code></td>
            <td>The SPI action to execute</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>


### SystemParameterAction: string

* `setcursors` - Refresh the system cursors


Process Finalizer
-----

A Process finalizer can trigger a process start, stop, or restart.

<table>
    <thead>
        <tr>
            <th>Property</th>
            <th>Type</th>
            <th colspan="2">Description</th>
        </tr>
    <tbody>
        <tr>
            <th><code>type</code></th>
            <td><code>string</code></td>
            <td><code>"com.microsoft.windows.process"</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>exe</code></th>
            <td><code>string</code></td>
            <td>The executable name, often a registry subkey within <code>HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths</code></td>
            <td>Required</td>
        </tr>
        <tr>
            <th><code>action</code></th>
            <td><code>ProcessAction</code></td>
            <td>The process action to perform</td>
            <td>Required</td>
        </tr>
    </tbody>
</table>


### ProcessAction: string

* `start` - Starts the process (if not running)
* `stop` - Stops the process (if running)
* `restart` - Stops then starts the process (if running; does nothing if process is not running)

References
==========

YAML references can be used as variables for repeated values like filenames.  References can be declared anywhere, including 
under arbitrary top-level keys.

````
files:
  - &CONFIG1 $(APPDATA)\Path\To\Config.ini

solutions:
  -
    identifier: com.example.solution
    settings:
      -
        name: setting1
        type: string
        default: test
        handler:
          type: com.microsoft.windows.ini
          filename: *CONFIG1
          section: main
          key: setting1

````
