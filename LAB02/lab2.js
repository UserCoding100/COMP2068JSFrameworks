const prompt = require('prompt');

function startGame() {
  
  prompt.start();

  
  const schema = {
    properties: {
      userSelection: {
        description: 'Choose ROCK, PAPER, or SCISSORS',
        pattern: /^(ROCK|PAPER|SCISSORS)$/i, // case insensitive
        message: 'Please pick either ROCK, PAPER, or SCISSORS',
        required: true
      }
    }
  };

  
  prompt.get(schema, function (err, result) {
    if (err) return console.error(err);
    
    
    let user_sel = result.user_sel.toUpperCase();
    console.log(`User Selection: ${user_sel}`);

    
    let rand_num = Math.random();
    let comp_sel = '';
    if (rand_num <= 0.34) {
      comp_sel = 'PAPER';
    } else if (rand_num <= 0.67) {
      comp_sel = 'SCISSORS';
    } else {
      comp_sel = 'ROCK';
    }
    console.log(`Computer Selection: ${comp_sel}`);

   
    let outcome = '';
    if (user_sel === comp_sel) {
      outcome = "It's a tie";
    } else if (
      (user_sel === 'ROCK' && comp_sel === 'SCISSORS') ||
      (user_sel === 'PAPER' && comp_sel === 'ROCK') ||
      (user_sel === 'SCISSORS' && comp_sel === 'PAPER')
    ) {
      outcome = 'User Wins';
    } else {
      outcome = 'Computer Wins';
    }

    console.log(outcome);
  });
}

startGame();
