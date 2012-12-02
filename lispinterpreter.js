//**************************************************
//PRASANTH KUMAR A
//Tiny Lisp Interpreter In Javascript
//**************************************************

var Symbol = String;
//--------------------------------------------------

var environment = function (e) {
    	var i, env = {}, outer = e.outer || {};
        
    	var get_outer = function () {
                return outer;
    	};
    	    
    	var find = function (variable) {
                if (env.hasOwnProperty(variable)) {
                        return env;
                } else {
            		return outer.find(variable);
        	}
    	};
    
    	if (0 !== e.par.length) {
        	for (i = 0; i < e.par.length; i += 1) {
            		env[e.par[i]] = spec.args[i];
        	}
    	}

    	env.get_outer = get_outer;
    	env.find = find;
    
    	return env;
};

/**********************************************************************/

var add_globals = function (env) {

    	var mathMethods = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'], i;

    	for (i = 0; i < mathMethods.length; i += 1) {
        	env[mathMethods[i]] = Math[mathMethods[i]];
    	}
    	env['+'] = function (a, b) {return a + b;};
    	env['-'] = function (a, b) {return a - b;};
    	env['*'] = function (a, b) {return a * b;};
    	env['/'] = function (a, b) {return a / b;};
    	env['>'] = function (a, b) {return a > b;};
    	env['<'] = function (a, b) {return a < b;};
    	env['>='] = function (a, b) {return a >= b;};
    	env['<='] = function (a, b) {return a <= b;};
    	env['='] = function (a, b) {return a === b;};
        env['remainder'] = function (a, b) {return a % b;};
    	env['equal?'] = function (a, b) {return a === b;};
    	env['eq?'] = function (a, b) {return a === b;}; 
        env['length'] = function (x) { return x.length; };
        env['cons'] = function (x, y) { var arr = [x]; return arr.concat(y); };
    	env['car'] = function (x) { return (x.length !== 0) ? x[0] : null; };
    	env['cdr'] = function (x) { return (x.length > 1) ? x.slice(1) : null; }; 
        env['append'] = function (x, y) { return x.concat(y); };
    	env['list'] = function () { return Array.prototype.slice.call(arguments); }; 
        env['list?'] = function (x) { return x && typeof x === 'object' && x.constructor === Array ; }; 
        env['null?'] = function (x) { return (!x || x.length === 0); };
        env['symbol?'] = function (x) { return typeof x === 'string'; };
    	return env;
};


var global_env = add_globals(environment({params: [], args: [], outer: undefined}));

//Evaluation of the tree (list of lists) through selective approach via Environment(dictionary)

var eval = function (x, env) {
    	var i;
    	env = env || global_env;

    	if (typeof x === 'string') {        
        	return env.find(x.valueOf())[x.valueOf()];
    	} else if (typeof x === 'number') { 
        	return x;
    	} else if (x[0] === 'quote') {      
        	return x[1];
    	} else if (x[0] === 'if') {         
        	var test = x[1];
        	var conseq = x[2];
        	var alt = x[3];
        	if (eval(test, env)) {
            		return eval(conseq, env);
        	} else {
            		return eval(alt, env);
        	}
    	} else if (x[0] === 'set!') {                       
        	env.find(x[1])[x[1]] = eval(x[2], env);
    	} else if (x[0] === 'define') {     
        	env[x[1]] = eval(x[2], env);
    	} else if (x[0] === 'lambda') {     
        	var vars = x[1];
        	var exp = x[2];
        	return function () {
                	return eval(exp, environment({params: vars, args: arguments, outer: env }));
        	};
    	} else if (x[0] === 'begin') {      
        	var val;
        	for (i = 1; i < x.length; i += 1) {
            	val = eval(x[i], env);
        }
        return val;
    	} else {                            
        		var exps = [];
        		for (i = 0; i < x.length; i += 1) {
            		exps[i] = eval(x[i], env);
        	}
        	var proc = exps.shift();
        	return proc.apply(env, exps);
    	}
};

var atom = function (t) {
    	if (isNaN(t)) {
                return t;
    	} else {
                return +t; 
    	}
};

//Converting string into list of tokens

function tokenize(s){
	s=s.replace(/\(/g," ( ").replace(/\)/g," ) ").split(" ")
 	var p=[];
 	for(i in s){
 		if(s[i]!=""){
 			p.push(s[i]);
 		}
 	}
	return p;
}

//function to give tree like structure(list of lists)

var read_from = function (tokens) {
    if (0 === tokens.length) {
                throw {
                        name: 'SyntaxError',
                        message: 'unexpected EOF while reading'
                };
        }
    var token = tokens.shift();
    if ('(' === token) {
                var L = [];
        while (')' !== tokens[0]) {
            L.push(read_from(tokens));
        }
        tokens.shift(); 
        return L;
    } else {
                if (')' === token) {
                        throw {
                                name: 'SyntaxError',
                                message: 'unexpected )'
                        };
                } else {
                        return atom(token);
                }
    }
};


var parse = read_from;


//Creating a custom REPL

  process.stdin.resume();
  process.stdout.write('lisp]=> ');
  process.stdin.on('data',function(input){
  input = input.toString();
  var val = eval(parse(tokenize(input)))
  if (val != undefined)
  {
    process.stdout.write('Result:'+val);
  }
  else {process.stdout.write('lisp]=> ');
  }
  }
  );
  

