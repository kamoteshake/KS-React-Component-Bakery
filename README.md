# KS React Component Generator
This is a VS Code extension that generates a React component file structure (directory and files) in a singe button click or command.

> Note: This is tailored to our team's standards and patterns. I tried to add options to make it work as generic as possible but out of the box, it follows our team's standard.

## Usage
There are two ways to add a new React component.

### Button
![button flow](/images/button_flow.gif)

### Context Menu
![context menu flow](/images/context_menu_flow.gif)

## Features
### Real-Time Validation
There are a couple of validation happening when typing the component name.
#### No Spaces
![no space](/images/no_space.png)

#### No Special Characters
![no special characters](/images/no_special_characters.png)

#### PascalCase
![pascal case](/images/pascal_case.png)

#### No Duplicate Components
![no duplicates](/images/no_duplicates.png)

## Known Issues
Since there isn't an official API to get the selected file's URI, I had to utilize the `copyFilePath` command. This copies the file path to the clipboard. I have added some processes which retains your last clipboard entry but it will lose its rich state in some OS.

## Release Notes
### 1.0.0

Initial release of KS React Component Generator
