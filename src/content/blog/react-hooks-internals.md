---
title: 'Como React Hooks Funcionam Internamente - Por Baixo dos Panos'
description: 'Uma análise técnica detalhada de como React Hooks gerenciam estado através de fibers e tokens de instância.'
pubDate: 'Oct 22 2025'
updatedDate: 'Oct 22 2025'
tags: ['react', 'hooks', 'internals', 'fiber', 'avançado', 'javascript']
language: 'pt'
---

# Como React Hooks Funcionam Internamente - Por Baixo dos Panos

## Introdução

Você já se perguntou como o React consegue "lembrar" do estado dos seus hooks entre re-renderizações? Como o `useState` sabe qual estado pertence a qual componente? A resposta está na arquitetura interna do React e no conceito de **fibers**.

Neste post, vamos mergulhar profundamente no funcionamento interno dos React Hooks, explorando como eles mantêm estado através de uma implementação simplificada que demonstra os conceitos fundamentais.

## O Problema: Como Hooks Sabem Onde Estão?

React Hooks são apenas funções JavaScript. Quando você escreve:

```jsx
function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  return <div>{count} - {name}</div>;
}
```

Como o React sabe que o primeiro `useState` é para `count` e o segundo é para `name`? Como ele mantém esses estados separados entre diferentes instâncias do mesmo componente?

**A resposta:** Através de uma **lista ligada de hooks** e um **cursor de posição** que avança a cada chamada de hook.

## A Arquitetura: Fibers e Lista Ligada de Hooks

React Hooks fazem uso do **estado oculto** de um componente, que é armazenado dentro de uma **fiber**. Uma fiber é uma entidade que corresponde a uma instância de componente e mantém uma **lista ligada** de todos os hooks utilizados.

> **Fiber**: A unidade de trabalho no React que representa um nó na árvore de componentes e mantém informações sobre estado, props, hooks e a estrutura do DOM.

### Estrutura de Dados Real

Cada hook na lista ligada tem esta estrutura:

```javascript
const hook = {
  memoizedState: value,      // O valor atual do estado
  baseState: value,          // Estado base para updates
  queue: updateQueue,        // Fila de atualizações pendentes
  next: nextHook            // Próximo hook na lista (linked list)
};
```

### Visualização da Lista Ligada

Quando você tem múltiplos hooks:

```jsx
function Component() {
  const [count, setCount] = useState(0);      // Hook 1
  const [name, setName] = useState('João');   // Hook 2
  const [active, setActive] = useState(true); // Hook 3
}
```

O React cria esta estrutura:

```
fiber.memoizedState
    ↓
[Hook 1: count=0] → [Hook 2: name='João'] → [Hook 3: active=true] → null
    ↑                    ↑                        ↑
  useState()           useState()              useState()
```

### Como o Cursor Funciona

**Primeira Renderização (Mount):**
```
Cursor: null
useState(0)   → Cria Hook1, cursor aponta para Hook1
useState('')  → Cria Hook2, Hook1.next = Hook2, cursor aponta para Hook2  
useState([])  → Cria Hook3, Hook2.next = Hook3, cursor aponta para Hook3
```

**Re-renderização (Update):**
```
Cursor: Hook1 (início da lista)
useState(0)   → Lê Hook1, cursor avança para Hook1.next
useState('')  → Lê Hook2, cursor avança para Hook2.next
useState([])  → Lê Hook3, cursor avança para Hook3.next
```

## Implementação Simplificada

Vamos construir uma implementação que demonstra como o React gerencia múltiplos hooks através de uma lista ligada.

### 1. As Estruturas de Dados

```javascript
let currentlyRenderingFiber = null;  // Fiber sendo renderizada
let workInProgressHook = null;        // Hook atual na lista
let currentHook = null;               // Hook correspondente na renderização anterior
```

Essas variáveis globais são fundamentais:

- **`currentlyRenderingFiber`**: Rastreia qual componente (fiber) está sendo renderizado
- **`workInProgressHook`**: Ponteiro para o hook atual durante a construção da lista
- **`currentHook`**: Ponteiro para o hook correspondente na lista anterior (para updates)

### 2. A Implementação Realista do useState

```javascript
function useState(initialState) {
  let hook;
  
  // MOUNTING: Primeira renderização
  if (currentHook === null) {
    hook = {
      memoizedState: initialState,
      queue: [],
      next: null
    };
    
    // Primeiro hook do componente
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = hook;
      workInProgressHook = hook;
    } 
    // Hooks subsequentes - adiciona à lista ligada
    else {
      workInProgressHook.next = hook;
      workInProgressHook = hook;
    }
  } 
  // UPDATE: Re-renderização
  else {
    hook = currentHook;
    currentHook = currentHook.next; // Avança o cursor
  }
  
  // Função para atualizar o estado
  const setState = (action) => {
    // Se action é função, chama com estado atual
    const newState = typeof action === 'function' 
      ? action(hook.memoizedState) 
      : action;
    
    if (newState !== hook.memoizedState) {
      hook.memoizedState = newState;
      scheduleRender(); // Agenda re-render
    }
  };
  
  return [hook.memoizedState, setState];
}
```

**Como funciona passo a passo:**

1. **Verifica o contexto**: Se `currentHook` é null, estamos no mount (primeira vez)
2. **Mount**: Cria novo hook e adiciona à lista ligada
3. **Update**: Reutiliza hook existente e avança o cursor
4. **Retorna**: Estado atual e função setter

### 3. O Processo de Renderização com Lista Ligada

```javascript
function renderComponent(Component, props) {
  // Cria ou recupera a fiber para este componente
  const fiber = {
    type: Component,
    memoizedState: null,  // Cabeça da lista ligada de hooks
    alternate: null        // Fiber da renderização anterior
  };
  
  // Define a fiber atual
  currentlyRenderingFiber = fiber;
  
  // Reseta ponteiros para re-renderização
  currentHook = fiber.alternate?.memoizedState || null;
  workInProgressHook = null;
  
  // Executa o componente - hooks serão chamados aqui
  const children = Component(props);
  
  // Salva o resultado
  const result = {
    fiber: fiber,
    children: children
  };
  
  // Limpa contexto global
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
  
  return result;
}
```

### 4. Exemplo Completo com Múltiplos Hooks

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('React');
  
  console.log('Renderizando:', { count, step, name });
  
  return {
    count,
    step,
    name,
    increment: () => setCount(c => c + step),
    changeStep: (newStep) => setStep(newStep),
    changeName: (newName) => setName(newName)
  };
}

// PRIMEIRA RENDERIZAÇÃO (Mount)
const render1 = renderComponent(Counter, {});
// Lista criada: Hook1(count:0) → Hook2(step:1) → Hook3(name:'React')

console.log(render1.children.count); // 0

// Atualiza o step
render1.children.changeStep(5);

// SEGUNDA RENDERIZAÇÃO (Update)
// Lista mantida: Hook1(count:0) → Hook2(step:5) → Hook3(name:'React')
const render2 = renderComponent(Counter, {});
console.log(render2.children.step); // 5

// Incrementa contador
render2.children.increment();

// TERCEIRA RENDERIZAÇÃO
// Lista mantida: Hook1(count:5) → Hook2(step:5) → Hook3(name:'React')
const render3 = renderComponent(Counter, {});
console.log(render3.children.count); // 5
```

## Por Que Isso Funciona?

O segredo está na **associação de contexto**:

1. **Timing**: O renderer React chama a função do componente
2. **Contexto**: Durante essa chamada, os hooks sabem qual instância está ativa
3. **Persistência**: O estado é armazenado fora do componente, no sistema de fibers
4. **Consistência**: A mesma ordem de chamada garante que hooks acessem o estado correto

## Limitações e Regras dos Hooks

Esta implementação também explica por que temos as **Regras dos Hooks**:

### ❌ Não chame hooks condicionalmente

```javascript
function BadComponent() {
  if (someCondition) {
    const [state] = useState(0); // ❌ Ordem pode mudar
  }
  const [other] = useState(''); // ❌ Posição inconsistente
}
```

### ❌ Não chame hooks em loops

```javascript
function BadComponent() {
  for (let i = 0; i < count; i++) {
    const [state] = useState(i); // ❌ Número de hooks varia
  }
}
```

### ✅ Sempre chame na mesma ordem

```javascript
function GoodComponent() {
  const [state1] = useState(0);   // ✅ Sempre primeira posição
  const [state2] = useState('');  // ✅ Sempre segunda posição
  const [state3] = useState([]);  // ✅ Sempre terceira posição
}
```

## Hooks Avançados

Assim como `useState`, outros hooks seguem o mesmo padrão:

### useEffect

```javascript
const compEffects = new Map();

function useEffect(callback, deps) {
  const instance = currentlyRenderedCompInstance;
  const prevDeps = compEffects.get(instance);
  
  // Verifica se as dependências mudaram
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

## React Fiber: A Implementação Real

Na implementação real do React, isso é muito mais complexo:

- **Fiber tree**: Estrutura de dados sofisticada para gerenciar componentes
- **Work loops**: Sistema de priorização e interrupção
- **Hook list**: Lista ligada de hooks por componente
- **Reconciliation**: Algoritmo de diferenciação otimizado

### Estrutura de uma Fiber

```javascript
// Simplificação da estrutura real
const fiber = {
  type: Component,           // Função ou classe do componente
  props: {},                // Props do componente
  state: null,              // Estado (para classes)
  memoizedState: null,      // Lista de hooks
  child: null,              // Primeiro filho
  sibling: null,            // Próximo irmão
  return: null,             // Fiber pai
  effectTag: null,          // Tipo de operação (update, insert, etc.)
  // ...muito mais
};
```

## Implicações para Desenvolvimento

Entender esses conceitos internos ajuda em:

### 1. **Debugging**
```javascript
// Por que isso não funciona?
function Component() {
  if (loading) return <Spinner />;
  
  const [data] = useState([]); // ❌ Hook condicional!
  return <List data={data} />;
}
```

### 2. **Performance**
```javascript
// Evitar re-criação de closures
function Component() {
  const [count, setCount] = useState(0);
  
  // ❌ Nova função a cada render
  const increment = () => setCount(count + 1);
  
  // ✅ Função estável
  const increment = useCallback(() => setCount(c => c + 1), []);
}
```

### 3. **Testes**
```javascript
// Entender como o React gerencia estado ajuda em testes
test('component state persistence', () => {
  const { rerender } = render(<Counter />);
  // Estado persiste entre re-renders...
});
```

## Conclusão

React Hooks são uma abstração elegante sobre um sistema complexo de gerenciamento de estado. A "mágica" acontece através de:

1. **Contexto global** que identifica o componente atual
2. **Mapeamento** entre componentes e seus estados
3. **Ordem consistente** de chamada dos hooks
4. **Sistema de fibers** para gerenciamento eficiente

Compreender esses conceitos não apenas satisfaz a curiosidade técnica, mas também torna você um desenvolvedor React mais competente, capaz de:

- Debuggar problemas complexos
- Escrever código mais performático
- Evitar bugs relacionados às regras dos hooks
- Contribuir para projetos open source do ecossistema React

## Recursos Adicionais

- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [React Hooks RFC](https://github.com/reactjs/rfcs/blob/main/text/0068-react-hooks.md)

---

*Este post oferece uma visão simplificada dos conceitos internos. A implementação real do React é significativamente mais complexa e otimizada.*