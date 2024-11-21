class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  }
  
  class WidgetInfo {
    constructor(id, result, name, start, end, offset) {
      this.id = id;
      this.result = result;
      this.name = name;
      this.start = start;
      this.end = end;
      this.offset = offset;
    }
  }
  
  class WidgetDetail {
    constructor(widgetName, start, end, properties) {
      this.widgetName = widgetName;
      this.start = start;
      this.end = end;
      this.properties = properties;
    }
  }
  
  class WidgetDetailProperty {
    constructor(type, name, value, required) {
      this.type = type;
      this.name = name;
      this.value = value;
      this.required = required;
    }
  }
  
  class Result {
    constructor(properties) {
      this.properties = properties;
    }
  }
  
  class Property {
    constructor(
      expression,
      id,
      isRequired,
      isSafeToUpdate,
      name,
      children,
      editor,
      value,
      type,
      defvalue,
      exvalue
    ) {
      this.expression = expression;
      this.id = id;
      this.isRequired = isRequired;
      this.isSafeToUpdate = isSafeToUpdate;
      this.name = name;
      this.children = children;
      this.editor = editor;
      this.value = value;
      this.type = type;
      this.defvalue = defvalue;
      this.exvalue = exvalue;
    }
  }
  
  class PropertyChild {
    constructor(
      id,
      isRequired,
      isSafeToUpdate,
      name,
      children,
      documentation,
      editor,
      expression
    ) {
      this.id = id;
      this.isRequired = isRequired;
      this.isSafeToUpdate = isSafeToUpdate;
      this.name = name;
      this.children = children;
      this.documentation = documentation;
      this.editor = editor;
      this.expression = expression;
    }
  }
  
  class ChildChild {
    constructor(
      documentation,
      id,
      isRequired,
      isSafeToUpdate,
      name,
      children,
      editor
    ) {
      this.documentation = documentation;
      this.id = id;
      this.isRequired = isRequired;
      this.isSafeToUpdate = isSafeToUpdate;
      this.name = name;
      this.children = children;
      this.editor = editor;
    }
  }
  
  class PurpleEditor {
    constructor(kind) {
      this.kind = kind;
    }
  }
  
  class PropertyEditor {
    constructor(kind, enumItems) {
      this.kind = kind;
      this.enumItems = enumItems;
    }
  }
  
  class Enum {
    constructor(className, name, documentation) {
      this.className = className;
      this.name = name;
      this.documentation = documentation;
    }
  }
  
  class Value {
    constructor(enumValue) {
      this.enumValue = enumValue;
    }
  }
  
  

  