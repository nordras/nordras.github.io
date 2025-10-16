---
title: 'React Hello World - Seu Primeiro Componente'
description: 'Aprenda a criar seu primeiro componente React com um exemplo prático de Hello World, incluindo conceitos básicos e boas práticas.'
pubDate: 'Oct 16 2025'
language: 'pt'
---

# React Hello World - Seu Primeiro Componente

Bem-vindo ao mundo do React! Neste tutorial, vamos criar nosso primeiro componente React com um exemplo clássico: o **Hello World**.

## O que é React?

React é uma biblioteca JavaScript para construir interfaces de usuário, desenvolvida pelo Facebook. Ela permite criar componentes reutilizáveis e gerenciar o estado da aplicação de forma eficiente.

## Criando seu Primeiro Componente

Vamos começar com o exemplo mais básico - um componente funcional que exibe "Hello World":

```jsx
import React from 'react';

function HelloWorld() {
  return (
    <div className="hello-container">
      <h1>Hello, World!</h1>
      <p>Este é meu primeiro componente React! 🚀</p>
    </div>
  );
}

export default HelloWorld;
```

## Versão com Props

Agora vamos tornar nosso componente mais dinâmico usando **props**:

```jsx
import React from 'react';

function HelloWorld({ name = "World", emoji = "👋" }) {
  return (
    <div className="hello-container">
      <h1>Hello, {name}! {emoji}</h1>
      <p>Bem-vindo ao React!</p>
    </div>
  );
}

export default HelloWorld;
```

### Como usar o componente:

```jsx
// Uso básico
<HelloWorld />

// Com props personalizadas
<HelloWorld name="Desenvolvedor" emoji="🚀" />
<HelloWorld name="João" emoji="😊" />
```

## Adicionando Estado com useState

Vamos criar uma versão interativa usando o hook `useState`:

```jsx
import React, { useState } from 'react';

function InteractiveHello() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  const handleGreet = () => {
    setCount(count + 1);
  };

  return (
    <div className="interactive-hello">
      <h2>Hello World Interativo</h2>
      
      <input
        type="text"
        placeholder="Digite seu nome..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="name-input"
      />
      
      <div className="greeting">
        <h3>
          Hello, {name || 'World'}! 
          {count > 0 && ` (${count}x)`}
        </h3>
      </div>
      
      <button 
        onClick={handleGreet}
        className="greet-button"
      >
        Cumprimentar {count > 0 ? 'Novamente' : ''}
      </button>
    </div>
  );
}

export default InteractiveHello;
```

## Estilização com CSS

Aqui está o CSS para tornar nossos componentes mais elegantes:

```css
.hello-container {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin: 1rem auto;
  max-width: 500px;
}

.hello-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.interactive-hello {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem auto;
}

.name-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease;
}

.name-input:focus {
  outline: none;
  border-color: #667eea;
}

.greet-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.greet-button:hover {
  background: #5a67d8;
}

.greeting h3 {
  color: #2d3748;
  margin: 1rem 0;
  font-size: 1.5rem;
}
```

## Conceitos Importantes

### 1. **JSX (JavaScript XML)**
```jsx
// JSX permite escrever HTML dentro do JavaScript
const element = <h1>Hello, World!</h1>;
```

### 2. **Props (Propriedades)**
```jsx
// Props são dados passados de pai para filho
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

### 3. **State (Estado)**
```jsx
// State gerencia dados que podem mudar
const [message, setMessage] = useState('Hello, World!');
```

### 4. **Event Handling**
```jsx
// Manipulação de eventos em React
const handleClick = () => {
  console.log('Botão clicado!');
};

<button onClick={handleClick}>Clique aqui</button>
```

## Exemplo Completo - App.js

Aqui está como usar todos os componentes juntos:

```jsx
import React from 'react';
import HelloWorld from './components/HelloWorld';
import InteractiveHello from './components/InteractiveHello';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Minha Primeira App React</h1>
      </header>
      
      <main>
        <HelloWorld />
        <HelloWorld name="React" emoji="⚛️" />
        <InteractiveHello />
      </main>
      
      <footer>
        <p>Criado com React ❤️</p>
      </footer>
    </div>
  );
}

export default App;
```

## Próximos Passos

Agora que você criou seu primeiro componente React, aqui estão algumas sugestões para continuar aprendendo:

1. **Explore mais Hooks**: `useEffect`, `useContext`, `useReducer`
2. **Aprenda sobre Componentes de Classe** (legacy, mas importante conhecer)
3. **Pratique com Projetos**: Todo List, Calculator, Weather App
4. **Estude Roteamento**: React Router
5. **Gerenciamento de Estado**: Context API, Redux, Zustand

## Conclusão

O Hello World é apenas o começo da sua jornada com React! Este exemplo simples demonstra os conceitos fundamentais:

- ✅ Componentes funcionais
- ✅ Props e destructuring
- ✅ Hooks (useState)
- ✅ Event handling
- ✅ Conditional rendering
- ✅ Estilização

Continue praticando e experimentando com diferentes componentes. O React tem uma curva de aprendizado suave, e logo você estará criando aplicações incríveis!

---

**Dica de Ouro**: Pratique criando pequenos componentes todos os dias. A consistência é a chave para dominar React! 🚀