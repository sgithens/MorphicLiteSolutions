The solutions registry is written and maintained in [YAML](https://yaml.org).

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
    </tbody>
</table>

Type : string
-----

* `string`
* `integer`
* `double`
* `boolean`

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
