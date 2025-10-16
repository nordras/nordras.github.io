---
title: 'React Hello World - Introdução'
description: 'Uma introdução simples ao React com o clássico exemplo Hello World.'
pubDate: 'Oct 16 2025'
updatedDate: 'Oct 16 2025'
tags: ['react', 'javascript', 'tutorial', 'iniciante']
language: 'pt'
---

# React Hello World - Introdução

O React é uma biblioteca JavaScript para construir interfaces de usuário, desenvolvida pelo Facebook. É uma das tecnologias mais populares para desenvolvimento front-end atualmente.

## O que é React?

React é uma biblioteca que permite criar componentes reutilizáveis para construir interfaces de usuário de forma eficiente. Ele usa um conceito chamado Virtual DOM para otimizar as atualizações na página.

### Principais características:

- **Componentes**: Blocos reutilizáveis de código
- **JSX**: Sintaxe que mistura JavaScript com HTML
- **Virtual DOM**: Representação virtual da interface para melhor performance
- **Unidirecional**: Fluxo de dados em uma direção

## Seu Primeiro Componente

Aqui está o exemplo mais básico de um componente React - o famoso "Hello World":

```jsx
function HelloWorld() {
    return <h1>Hello, World!</h1>;
}

export default HelloWorld;
```

## Componente com Props

Você pode tornar o componente mais dinâmico usando props (propriedades):

```jsx
function HelloWorld({ name }) {
    return <h1>Hello, {name}!</h1>;
}

// Uso do componente
function App() {
    return (
        <div>
            <HelloWorld name="React" />
            <HelloWorld name="Mundo" />
        </div>
    );
}

export default App;
```

## Componente Interativo

Para adicionar interatividade, você pode usar o hook `useState`:

```jsx
import { useState } from 'react';

function HelloWorld() {
    const [name, setName] = useState('World');

    return (
        <div>
            <h1>Hello, {name}!</h1>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite um nome"
            />
        </div>
    );
}

export default HelloWorld;
```

## Próximos Passos

Agora que você conhece o básico do React, pode explorar:

- **Estado e Props**: Como gerenciar dados nos componentes
- **Hooks**: useState, useEffect e outros
- **Roteamento**: React Router para navegação
- **Estilização**: CSS Modules, Styled Components ou Tailwind

O React tem uma curva de aprendizado, mas é uma ferramenta poderosa para criar aplicações web modernas!