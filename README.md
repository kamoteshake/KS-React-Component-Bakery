<img src="/images/logo.png" width="200px" height="auto" style="display: block;  margin: 0 auto;" alt="logo" />

# 🍞 KS React Component Bakery
**Welcome to the KS React Component Bakery** — the only place in VS Code where your React components rise to perfection.
Why knead boilerplate by hand when the bakery can mix, proof, and bake everything for you?

Pick your ingredients (**TypeScript? React 18? A sprinkle of test files?**), choose where you want your pastry component to live, and *voilà* — a freshly baked component folder appears, warm and editor-ready.

**Consistent. Delicious. And absolutely mess-free.**

## 🥐 Usage
There are two ways to add a new React component.

### Button
![button flow](/images/button_flow.gif)

### Context Menu
![context menu flow](/images/context_menu_flow.gif)

## 🧁 Features
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

## 🍪 Known Issues
Since there isn't an official API to get the selected file's URI, I had to utilize the `copyFilePath` command. This copies the file path to the clipboard. I have added some processes which retains your last clipboard entry but it will lose its rich state in some OS.

## 🎉 Release Notes
### 1.0.0

Initial release of KS React Component Bakery
