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

## A Arquitetura: Fibers e Estado Oculto

React Hooks fazem uso do **estado oculto** de um componente, que é armazenado dentro de uma **fiber**. Uma fiber é uma entidade que corresponde a uma instância de componente (em um sentido mais amplo, já que componentes funcionais não criam instâncias como componentes de classe fazem).

> **Fiber**: A unidade de trabalho no React que representa um nó na árvore de componentes e mantém informações sobre estado, props, e a estrutura do DOM.

## Implementação Simplificada

Vamos analisar uma implementação simplificada que demonstra os conceitos fundamentais:

### 1. As Estruturas de Dados

```javascript
let currentlyRenderedCompInstance;
const compStates = new Map(); // mapeia instâncias de componentes para seus estados
const compInstances = new Map(); // mapeia funções de componentes para instâncias
```

Essas três variáveis são fundamentais:

- **`currentlyRenderedCompInstance`**: Rastreia qual componente está sendo renderizado no momento
- **`compStates`**: Armazena os estados de cada instância de componente
- **`compInstances`**: Mapeia componentes para suas instâncias ativas

### 2. A Implementação do useState

```javascript
function useState(initialState) {
  // Se esta instância ainda não tem estado, inicializa
  if (!compStates.has(currentlyRenderedCompInstance))
    compStates.set(currentlyRenderedCompInstance, initialState);

  return [
    compStates.get(currentlyRenderedCompInstance), // estado atual
    val => compStates.set(currentlyRenderedCompInstance, val) // setter
  ];
}
```

**Como funciona:**

1. **Verificação**: Se a instância atual não tem estado armazenado, inicializa com `initialState`
2. **Retorno**: Retorna um array com o estado atual e uma função para atualizá-lo
3. **Contexto**: Usa `currentlyRenderedCompInstance` para saber a qual componente o estado pertence

### 3. O Processo de Renderização

```javascript
function render(comp, props) {
  // Cria um token único para esta instância
  const compInstanceToken = Symbol('Renderer token for ' + comp.name);

  // Registra a instância se ainda não existir
  if (!compInstances.has(comp))
    compInstances.set(comp, new Set());

  compInstances.get(comp).add(compInstanceToken);

  // Define o contexto atual para os hooks
  currentlyRenderedCompInstance = compInstanceToken;

  return { 
    instance: compInstanceToken,
    children: comp(props) // Chama o componente
  };
}
```

**Fluxo de execução:**

1. **Token único**: Cada renderização recebe um `Symbol` único
2. **Registro**: A instância é registrada no mapa de componentes
3. **Contexto**: `currentlyRenderedCompInstance` é definido
4. **Execução**: O componente é chamado com esse contexto ativo

## Exemplo Prático

Vamos ver como isso funcionaria na prática:

```javascript
// Componente de exemplo
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

// Primeira renderização
const result1 = render(Counter, {});
console.log(result1.children.count); // 0

// Incrementa o contador
result1.children.increment();

// Segunda renderização da mesma instância
currentlyRenderedCompInstance = result1.instance;
const result2 = Counter({});
console.log(result2.count); // 1
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
- [Inside Fiber: in-depth overview](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)
- [React Hooks RFC](https://github.com/reactjs/rfcs/blob/main/text/0068-react-hooks.md)

---

*Este post oferece uma visão simplificada dos conceitos internos. A implementação real do React é significativamente mais complexa e otimizada.*