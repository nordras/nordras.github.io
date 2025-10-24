---
title: 'How React Hooks Work Internally - Under the Hood'
description: 'A detailed technical analysis of how React Hooks manage state through fibers and instance tokens.'
pubDate: 'Oct 22 2025'
updatedDate: 'Oct 22 2025'
tags: ['react', 'hooks', 'internals', 'fiber', 'advanced', 'javascript']
language: 'en'
---

# How React Hooks Work Internally - Under the Hood

## Introduction

Have you ever wondered how React manages to "remember" your hooks' state between re-renders? How does `useState` know which state belongs to which component? The answer lies in React's internal architecture and the concept of **fibers**.

In this post, we'll dive deep into the internal workings of React Hooks, exploring how they maintain state through a simplified implementation that demonstrates the fundamental concepts.

## The Problem: How Do Hooks Know Where They Are?

React Hooks are just JavaScript functions. When you write:

```jsx
function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  return <div>{count} - {name}</div>;
}
```

How does React know that the first `useState` is for `count` and the second is for `name`? How does it keep these states separate between different instances of the same component?

## The Architecture: Fibers and Hidden State

React Hooks make use of a component's **hidden state**, which is stored inside a **fiber**. A fiber is an entity that corresponds to a component instance (in a broader sense, because functional components don't create instances like class components do).

> **Fiber**: The unit of work in React that represents a node in the component tree and maintains information about state, props, and DOM structure.

## Simplified Implementation

Let's analyze a simplified implementation that demonstrates the fundamental concepts:

### 1. The Data Structures

```javascript
let currentlyRenderedCompInstance;
const compStates = new Map(); // maps component instances to their states
const compInstances = new Map(); // maps component functions to instances
```

These three variables are fundamental:

- **`currentlyRenderedCompInstance`**: Tracks which component is currently being rendered
- **`compStates`**: Stores the states of each component instance
- **`compInstances`**: Maps components to their active instances

### 2. The useState Implementation

```javascript
function useState(initialState) {
  // If this instance doesn't have state yet, initialize it
  if (!compStates.has(currentlyRenderedCompInstance))
    compStates.set(currentlyRenderedCompInstance, initialState);

  return [
    compStates.get(currentlyRenderedCompInstance), // current state
    val => compStates.set(currentlyRenderedCompInstance, val) // setter
  ];
}
```

**How it works:**

1. **Check**: If the current instance doesn't have stored state, initialize with `initialState`
2. **Return**: Returns an array with the current state and a function to update it
3. **Context**: Uses `currentlyRenderedCompInstance` to know which component the state belongs to

### 3. The Rendering Process

```javascript
function render(comp, props) {
  // Create a unique token for this instance
  const compInstanceToken = Symbol('Renderer token for ' + comp.name);

  // Register the instance if it doesn't exist yet
  if (!compInstances.has(comp))
    compInstances.set(comp, new Set());

  compInstances.get(comp).add(compInstanceToken);

  // Set the current context for hooks
  currentlyRenderedCompInstance = compInstanceToken;

  return { 
    instance: compInstanceToken,
    children: comp(props) // Call the component
  };
}
```

**Execution flow:**

1. **Unique token**: Each render gets a unique `Symbol`
2. **Registration**: The instance is registered in the components map
3. **Context**: `currentlyRenderedCompInstance` is set
4. **Execution**: The component is called with this active context

## Practical Example

Let's see how this would work in practice:

```javascript
// Example component
function Counter(props) {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  
  return {
    count,
    step,
    increment: () => setCount(count + step),
    setStep
  };
}

// First render
const result1 = render(Counter, {});
console.log(result1.children.count); // 0

// Increment counter
result1.children.increment();

// Second render of same instance
currentlyRenderedCompInstance = result1.instance;
const result2 = Counter({});
console.log(result2.count); // 1
```

## Why Does This Work?

The secret lies in **context association**:

1. **Timing**: The React renderer calls the component function
2. **Context**: During that call, hooks know which instance is active
3. **Persistence**: State is stored outside the component, in the fiber system
4. **Consistency**: The same call order ensures hooks access the correct state

## Limitations and Rules of Hooks

This implementation also explains why we have the **Rules of Hooks**:

### ❌ Don't call hooks conditionally

```javascript
function BadComponent() {
  if (someCondition) {
    const [state] = useState(0); // ❌ Order can change
  }
  const [other] = useState(''); // ❌ Inconsistent position
}
```

### ❌ Don't call hooks in loops

```javascript
function BadComponent() {
  for (let i = 0; i < count; i++) {
    const [state] = useState(i); // ❌ Number of hooks varies
  }
}
```

### ✅ Always call in the same order

```javascript
function GoodComponent() {
  const [state1] = useState(0);   // ✅ Always first position
  const [state2] = useState('');  // ✅ Always second position
  const [state3] = useState([]);  // ✅ Always third position
}
```

## Advanced Hooks

Just like `useState`, other hooks follow the same pattern:

### useEffect

```javascript
const compEffects = new Map();

function useEffect(callback, deps) {
  const instance = currentlyRenderedCompInstance;
  const prevDeps = compEffects.get(instance);
  
  // Check if dependencies changed
  const hasChanged = !prevDeps || 
    !deps || 
    deps.some((dep, i) => dep !== prevDeps[i]);
  
  if (hasChanged) {
    callback();
    compEffects.set(instance, deps);
  }
}
```

### useContext

```javascript
const compContexts = new Map();

function useContext(context) {
  const instance = currentlyRenderedCompInstance;
  return compContexts.get(instance)?.get(context) || context.defaultValue;
}
```

## React Fiber: The Real Implementation

In React's actual implementation, this is much more complex:

- **Fiber tree**: Sophisticated data structure for managing components
- **Work loops**: Prioritization and interruption system
- **Hook list**: Linked list of hooks per component
- **Reconciliation**: Optimized diffing algorithm

### Fiber Structure

```javascript
// Simplification of the real structure
const fiber = {
  type: Component,           // Component function or class
  props: {},                // Component props
  state: null,              // State (for classes)
  memoizedState: null,      // Hook list
  child: null,              // First child
  sibling: null,            // Next sibling
  return: null,             // Parent fiber
  effectTag: null,          // Operation type (update, insert, etc.)
  // ...much more
};
```

## Implications for Development

Understanding these internal concepts helps with:

### 1. **Debugging**
```javascript
// Why doesn't this work?
function Component() {
  if (loading) return <Spinner />;
  
  const [data] = useState([]); // ❌ Conditional hook!
  return <List data={data} />;
}
```

### 2. **Performance**
```javascript
// Avoid re-creating closures
function Component() {
  const [count, setCount] = useState(0);
  
  // ❌ New function every render
  const increment = () => setCount(count + 1);
  
  // ✅ Stable function
  const increment = useCallback(() => setCount(c => c + 1), []);
}
```

### 3. **Testing**
```javascript
// Understanding how React manages state helps in testing
test('component state persistence', () => {
  const { rerender } = render(<Counter />);
  // State persists between re-renders...
});
```

## Conclusion

React Hooks are an elegant abstraction over a complex state management system. The "magic" happens through:

1. **Global context** that identifies the current component
2. **Mapping** between components and their states
3. **Consistent order** of hook calls
4. **Fiber system** for efficient management

Understanding these concepts not only satisfies technical curiosity but also makes you a more competent React developer, capable of:

- Debugging complex problems
- Writing more performant code
- Avoiding bugs related to hook rules
- Contributing to React ecosystem open source projects

## Additional Resources

- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Inside Fiber: in-depth overview](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)
- [React Hooks RFC](https://github.com/reactjs/rfcs/blob/main/text/0068-react-hooks.md)

---

*This post offers a simplified view of internal concepts. React's actual implementation is significantly more complex and optimized.*