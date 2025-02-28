const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: <api_key_here>
});

app.post('/', async (req, res) => {
  const { messages, query } = req.body;
  const response = await runQuery(query, messages);
  res.send(JSON.stringify({content: response.choices[0].message.content}));
});


const runQuery = async (query, messages) => {

  // formats conversation to be accepted by chatgpt api (for conversation state)
  const formatted = messages.sort((a,b) => a.id - b.id).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: [{type: 'text', text: msg.text}],
  }));
  formatted.push({role: 'user', content: query});
  formatted.unshift({
    'role': 'developer',
    'content': [
      {
        'type': 'text',
        'text': 'you are a helpful assistant that responds to queries by distilling the query down into a number. You can only respond with that number'
        // 'text': 'you are a helpful assistant that answers questions strictly with numbers. you can only respond with a number. interpret that how you wish.'
      }
    ]
  });

  return await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: formatted,
    store: true
  });
};

app.listen(3005, () => console.log('server running at 3005'));
