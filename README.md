# Overflow

A helper class to fit overflowing text inside the textbox area, by either **expanding** the textbox height or **compacting** the font size.

## API

* `exists` returns `true` whether textbox contains overflowing text, `false` otherwise,
* `expand` modifies the textbox height to fit the overflowing text,
* `compact` scales font size down until all the text fits inside the textbox.

```javascript

// Check whether textLayer contains overflowing text
Overflow.exists(textLayer);

// Modify the textbox height to fit the overflowing text
Overflow.expand(textLayer);

// Scale font size down until all the text fits inside the textbox
Overflow.compact(textLayer);

```
