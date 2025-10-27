---
title: 'Como React Hooks Funcionam Internamente - Por Baixo dos Panos'
description: 'Uma análise técnica detalhada de como React Hooks gerenciam estado através de fibers e tokens de instância.'
pubDate: 'Oct 22 2025'
updatedDate: 'Oct 22 2025'
tags: ['react', 'hooks', 'internals', 'fiber', 'avançado', 'javascript']
language: 'pt'
---

## Introdução

Certo, se você chegou aqui é talvez queira fazer um trabalho de faculdade, uma poc elaborada ou seja um curioso de plantão. <b><i>Então como o `useState` armazena dados</i></b>? A resposta está na arquitetura interna do React e no conceito de **fibers**.

Neste post pretendo explicar o funcionamento interno dos React Hooks, explorando como eles mantêm estado através de uma implementação simplificada que demonstra os conceitos fundamentais.

## Como Hooks Sabem Onde Estão?

React Hooks são apenas funções JavaScript. Quando você escreve:

```jsx
function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  return <div>{count} - {name}</div>;
}
```

Como é decidido que o primeiro `useState` é para `count` e o segundo é para `name`? Como ele mantém esses estados separados entre diferentes instâncias do mesmo componente?

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

O segredo está na **lista ligada + ordem consistente**:

### Fluxo Detalhado de uma Renderização

**1. Primeira Renderização (Mount)**
```
Antes: fiber.memoizedState = null

useState(0)    → Cria Hook1 {memoizedState: 0, next: null}
                 fiber.memoizedState = Hook1
                 
useState('')   → Cria Hook2 {memoizedState: '', next: null}
                 Hook1.next = Hook2
                 
useState([])   → Cria Hook3 {memoizedState: [], next: null}
                 Hook2.next = Hook3

Depois: fiber.memoizedState → Hook1 → Hook2 → Hook3 → null
```

**2. Re-renderização (Update)**
```
Antes: currentHook = fiber.memoizedState (Hook1)

useState(0)    → Lê Hook1, currentHook = Hook1.next (Hook2)
useState('')   → Lê Hook2, currentHook = Hook2.next (Hook3)
useState([])   → Lê Hook3, currentHook = Hook3.next (null)

Depois: Mesma lista, valores possivelmente atualizados
```

### Diagrama de Fluxo Visual

```
┌─────────────────────────────────────────────────────────┐
│                    COMPONENTE                            │
│                                                          │
│  function Counter() {                                   │
│    const [count, setCount] = useState(0);     ←─┐       │
│    const [step, setStep] = useState(1);       ←─┼─┐     │
│    const [name, setName] = useState('');      ←─┼─┼─┐   │
│  }                                              │ │ │   │
└─────────────────────────────────────────────────┼─┼─┼───┘
                                                  │ │ │
                    ┌─────────────────────────────┘ │ │
                    │         ┌─────────────────────┘ │
                    │         │         ┌─────────────┘
                    ▼         ▼         ▼
            ┌────────┐  ┌────────┐  ┌────────┐
            │ Hook 1 │─→│ Hook 2 │─→│ Hook 3 │─→ null
            │count: 0│  │step: 1 │  │name:'' │
            │queue:[]│  │queue:[]│  │queue:[]│
            └────────┘  └────────┘  └────────┘
                    ▲
                    │
            fiber.memoizedState
```

### Por Que a Ordem Importa

Se você quebrar a ordem, a lista ligada fica corrompida:

```javascript
// ❌ ERRADO - Ordem inconsistente
function BadComponent({ condition }) {
  const [a] = useState('a');
  
  if (condition) {
    const [b] = useState('b');  // ❌ Hook condicional!
  }
  
  const [c] = useState('c');
}
```

**Primeira renderização** (condition = true):
```
Hook1(a) → Hook2(b) → Hook3(c) → null
```

**Segunda renderização** (condition = false):
```
Hook1(a) → Hook2(c) → null
         ⚠️ Hook2 deveria ser 'b', mas recebe 'c'!
```

**Resultado**: Estado corrompido! 💥

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

Assim como `useState`, outros hooks seguem o mesmo padrão de lista ligada:

### useEffect

```javascript
function useEffect(callback, deps) {
  let hook;
  
  if (currentHook === null) {
    // Mount: cria novo hook
    hook = {
      memoizedState: {
        effect: callback,
        deps: deps,
        destroy: undefined  // cleanup function
      },
      next: null
    };
    
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = hook;
      workInProgressHook = hook;
    } else {
      workInProgressHook.next = hook;
      workInProgressHook = hook;
    }
    
    // Agenda execução do effect
    scheduleEffect(hook);
  } else {
    // Update: compara dependências
    hook = currentHook;
    const prevEffect = hook.memoizedState;
    
    const hasChanged = !deps || !prevEffect.deps ||
      deps.some((dep, i) => !Object.is(dep, prevEffect.deps[i]));
    
    if (hasChanged) {
      hook.memoizedState = {
        effect: callback,
        deps: deps,
        destroy: prevEffect.destroy
      };
      scheduleEffect(hook);
    }
    
    currentHook = currentHook.next;
  }
}
```

### useRef

```javascript
function useRef(initialValue) {
  let hook;
  
  if (currentHook === null) {
    // Mount: cria objeto ref
    hook = {
      memoizedState: { current: initialValue },
      next: null
    };
    
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = hook;
      workInProgressHook = hook;
    } else {
      workInProgressHook.next = hook;
      workInProgressHook = hook;
    }
  } else {
    // Update: mantém a mesma referência
    hook = currentHook;
    currentHook = currentHook.next;
  }
  
  return hook.memoizedState;  // Sempre o mesmo objeto
}
```

## Batching de Atualizações e Update Queue

Uma das otimizações mais importantes do React é o **batching**: múltiplas atualizações de estado resultam em apenas uma re-renderização.

### Como Funciona a Update Queue

Cada hook tem uma **fila de atualizações**:

```javascript
const hook = {
  memoizedState: currentValue,
  baseState: baseValue,
  queue: {
    pending: null,  // Circular linked list de updates
    dispatch: setState,
    lastRenderedState: currentValue
  },
  next: nextHook
};
```

### Implementação Realista com Update Queue

```javascript
function useState(initialState) {
  let hook;
  
  if (currentHook === null) {
    // Mount
    hook = {
      memoizedState: initialState,
      baseState: initialState,
      queue: {
        pending: null,
        dispatch: null
      },
      next: null
    };
    
    // Adiciona à lista ligada...
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = hook;
      workInProgressHook = hook;
    } else {
      workInProgressHook.next = hook;
      workInProgressHook = hook;
    }
  } else {
    // Update
    hook = currentHook;
    currentHook = currentHook.next;
  }
  
  // Cria dispatch se ainda não existe
  if (!hook.queue.dispatch) {
    hook.queue.dispatch = dispatchAction.bind(null, 
      currentlyRenderingFiber, 
      hook.queue
    );
  }
  
  // Processa updates pendentes
  if (hook.queue.pending !== null) {
    const newState = processUpdateQueue(
      hook.baseState, 
      hook.queue.pending
    );
    hook.memoizedState = newState;
    hook.queue.pending = null;
  }
  
  return [hook.memoizedState, hook.queue.dispatch];
}

function dispatchAction(fiber, queue, action) {
  // Cria um update object
  const update = {
    action,
    next: null
  };
  
  // Adiciona à circular linked list
  const pending = queue.pending;
  if (pending === null) {
    // Primeira update - cria lista circular
    update.next = update;
  } else {
    // Insere na lista circular
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
  
  // Agenda re-render
  scheduleUpdateOnFiber(fiber);
}

function processUpdateQueue(baseState, pendingQueue) {
  let update = pendingQueue.next;  // Começo da lista circular
  let newState = baseState;
  
  // Processa cada update na fila
  do {
    const action = update.action;
    newState = typeof action === 'function' 
      ? action(newState) 
      : action;
    update = update.next;
  } while (update !== pendingQueue.next);
  
  return newState;
}
```

### Exemplo de Batching

```javascript
function Component() {
  const [count, setCount] = useState(0);
  
  function handleClick() {
    setCount(1);      // Update 1 → queue
    setCount(2);      // Update 2 → queue
    setCount(c => c + 1); // Update 3 → queue
    // Apenas 1 re-render será agendado!
  }
  
  // Quando re-render acontecer:
  // processUpdateQueue(0, [1, 2, c=>c+1])
  // → 1 → 2 → 3 (resultado final)
}
```

### Visualização da Update Queue

```
Antes dos setStates:
hook.queue.pending = null
hook.memoizedState = 0

Após setCount(1):
┌─────────┐
│ Update1 │◄─┐
│ action:1│  │
└─────┬───┘  │
      └──────┘
hook.queue.pending → Update1

Após setCount(2):
┌─────────┐   ┌─────────┐
│ Update1 │──→│ Update2 │◄─┐
│ action:1│   │ action:2│  │
└─────────┘   └─────┬───┘  │
      ▲             └──────┘
      └──────────────────────
hook.queue.pending → Update2

Após setCount(c => c+1):
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Update1 │──→│ Update2 │──→│ Update3 │◄─┐
│ action:1│   │ action:2│   │ action:fn│  │
└─────────┘   └─────────┘   └─────┬───┘  │
      ▲                            └──────┘
      └────────────────────────────────────
hook.queue.pending → Update3 (circular!)

Durante re-render:
Processa: 1 → 2 → fn(2) = 3
Resultado: hook.memoizedState = 3
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

## A Fiber Tree e Hooks

Cada componente React é representado por um **Fiber node** na árvore de renderização. Os hooks ficam armazenados nesse Fiber:

```javascript
const fiber = {
  type: Component,           // Função do componente
  memoizedState: null,       // ← Primeiro hook da lista ligada
  memoizedProps: {},
  stateNode: null,
  return: parentFiber,       // Pai na árvore
  child: firstChildFiber,    // Primeiro filho
  sibling: nextSiblingFiber, // Próximo irmão
  alternate: null,           // Versão anterior (double buffering)
  // ... outros campos
};
```

### Fluxo Completo de Renderização

```
1. React chama seu componente
   └─→ currentlyRenderingFiber = fiber do componente
       currentHook = null
       workInProgressHook = null

2. Componente chama useState()
   ├─→ Mount: cria novo hook, adiciona à fiber.memoizedState
   └─→ Update: lê hook existente, avança currentHook

3. Componente chama useState() novamente
   ├─→ Mount: adiciona hook.next ao último workInProgressHook
   └─→ Update: lê currentHook.next

4. Componente retorna JSX
   └─→ React limpa currentlyRenderingFiber, currentHook, etc.

5. Usuário dispara setState()
   └─→ Adiciona update à queue circular do hook
       Agenda re-render do fiber
       
6. Na próxima renderização, volta ao passo 1
```

### Visualização da Fiber Tree

```
       App Fiber
       memoizedState → Hook1 → Hook2 → null
            ↓
      ┌────────────┐
      ↓            ↓
  Counter      Profile
  Fiber        Fiber
  memoizedState → Hook1 → Hook2 → Hook3 → null
  (count)        (name)  (email)  (bio)
```

Cada Fiber tem sua **própria lista ligada de hooks**, completamente independente.

## Conclusão

Agora você conhece os bastidores do React Hooks! Os principais aprendizados:

### Estrutura de Dados
- **Lista Ligada**: Cada Fiber mantém uma linked list de hooks (`Hook1 → Hook2 → Hook3 → null`)
- **Hook Object**: `{memoizedState, baseState, queue, next}` armazena estado, updates pendentes e o próximo hook
- **Update Queue**: Lista circular de updates para batching (`Update1 → Update2 → Update3 → Update1`)

### Algoritmo de Cursor
- **Mount Phase**: Cria novos hooks e os adiciona à lista ligada
- **Update Phase**: Percorre a lista existente com um cursor (`currentHook`)
- **Ordem Importa**: O cursor avança sequencialmente, hooks devem ser chamados na mesma ordem sempre

### Por Que as Regras Existem

1. **Não chame hooks dentro de condições**
   ```javascript
   // ❌ NUNCA faça isso
   if (condition) {
     useState(0);  // Hook pode sumir!
   }
   ```
   → Corrompe a lista ligada, causando mismatch entre mount e update

2. **Apenas em componentes React ou custom hooks**
   ```javascript
   // ❌ Hook fora de componente
   const value = useState(0);  // Sem fiber context!
   ```
   → Sem `currentlyRenderingFiber`, não há onde armazenar a lista de hooks

3. **No nível superior**
   ```javascript
   // ❌ Hook em callback
   useEffect(() => {
     useState(0);  // Cursor já foi resetado!
   }, []);
   ```
   → Hooks só funcionam durante a fase de renderização do componente

### Performance

- **Batching**: Múltiplos `setState` resultam em uma única re-renderização
- **Update Queue**: Processa todas as atualizações de uma vez
- **Fiber Architecture**: Double buffering permite React interromper e retomar trabalho

### Indo Além

Este modelo mostra os conceitos core. No React real há features avançadas:
- **Concurrent Mode**: Interrompe renderização para tarefas urgentes
- **Lanes**: Sistema de prioridades para updates
- **useTransition**: Marca updates como não-urgentes
- **Suspense**: Aguarda dados assíncronos na árvore de componentes

Compreender esses internals não só explica as "Regras dos Hooks", mas revela a elegância da arquitetura do React. A lista ligada é uma escolha de design brilhante: simples, eficiente e permite features avançadas como time-slicing.

## Recursos Adicionais e Fontes

- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [React Hooks RFC](https://github.com/reactjs/rfcs/blob/main/text/0068-react-hooks.md)
- [Código-fonte: ReactFiberHooks.js](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js)
- [React Fiber - O que muda agora?](https://raphamorim.io/entendendo-react-fiber/)
- [A deep dive into React Fiber](https://blog.logrocket.com/deep-dive-react-fiber/)

---

*Este post oferece uma visão aprofundada dos conceitos internos. A implementação real do React inclui otimizações adicionais e casos edge.*