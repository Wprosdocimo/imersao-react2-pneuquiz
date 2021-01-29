/* eslint-disable react/prop-types */
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import db from '../db.json';
import QuizLogo from '../src/components/QuizLogo';
import QuizBackground from '../src/components/QuizBackground';
// import Footer from '../src/components/Footer';
import Widget from '../src/components/Widget';
import QuizContainer from '../src/components/QuizContainer';
import Button from '../src/components/Button';
import LoadingQuiz from '../src/components/Loading';
import AlternativesForm from '../src/components/AlternativesForm';

function LoadingWidget() {
  return (
    <Widget>
      <Widget.Header>
        Carregando
      </Widget.Header>
      <Widget.Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0px',
        }}
      >
        <LoadingQuiz />
      </Widget.Content>
    </Widget>
  );
}

function ResultWidget({ name, results }) {
  return (
    <Widget>
      <Widget.Header>
        Tela de Resultado:
      </Widget.Header>
      <Widget.Content>
        <p>{`Valeu ${name.toUpperCase()}!!!`}</p>
        <p>
          Você acertou
          {' '}
          {results.reduce((somatoriaAtual, resultadoAtual) => {
            const isAcerto = resultadoAtual === true;
            if (isAcerto) {
              return somatoriaAtual + 1;
            }
            return somatoriaAtual;
          }, 0)}
          {/* {results.filter((x) => x).lenght} */}
          {' '}
          perguntas
        </p>
        <ul>
          {results.map((result, index) => (
            <li>
              #
              {`${index + 1} `}
              Resultado:
              {
              result === true
                ? ' Acertou'
                : ' Errou'
              }
            </li>
          ))}
        </ul>
      </Widget.Content>
    </Widget>
  );
}

function QuestionWidget({
  question,
  questionIndex,
  totalQuestions,
  onSubmit,
  addResults,
}) {
  const [selectedAlternative, setSelectedAlternative] = React.useState(undefined);
  const [isQuestionSubmited, setIsQuestionSubmited] = React.useState(false);
  const questionId = `question__${questionIndex}`;
  const isCorrect = selectedAlternative === question.answer;
  const hasAlternativeSelected = selectedAlternative !== undefined;

  return (
    <Widget>
      <Widget.Header>
        <h3>
          {`Perginta ${questionIndex + 1} de ${totalQuestions}`}
        </h3>
      </Widget.Header>
      <img
        alt="Descrição"
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
        }}
        src={question.image}
      />
      <Widget.Content>
        <h2>
          {question.title}
        </h2>
        <p>
          {question.description}
        </p>

        <AlternativesForm
          onSubmit={(infosDoEvento) => {
            infosDoEvento.preventDefault();
            setIsQuestionSubmited(true);
            setTimeout(() => {
              addResults(isCorrect);
              onSubmit();
              setIsQuestionSubmited(false);
              setSelectedAlternative(undefined);
            }, 3 * 1000);
          }}
        >
          {question.alternatives.map((alternative, alternativeIndex) => {
            const alternativeId = `alternative__${alternativeIndex}`;
            const alternativeStatus = isCorrect ? 'SUCCESS' : 'ERROR';
            const isSelected = selectedAlternative === alternativeIndex;
            return (
              <Widget.Topic
                as="label"
                key={alternativeId}
                htmlFor={alternativeId}
                data-selected={isSelected}
                data-status={isQuestionSubmited && alternativeStatus}
              >
                <input
                  style={{ display: 'none' }}
                  id={alternativeId}
                  name={questionId}
                  onChange={() => {
                    setSelectedAlternative(alternativeIndex);
                  }}
                  type="radio"
                />
                {alternative}
              </Widget.Topic>
            );
          })}
          {/* <pre>
            {JSON.stringify(question, null, 4)}
          </pre> */}
          <Button type="submit" disabled={!hasAlternativeSelected}>
            Confirmar
          </Button>
          {/* {isQuestionSubmited && isCorrect && <p>Você Acertou</p>}
          {isQuestionSubmited && !isCorrect && <p>Você Errou</p>} */}
        </AlternativesForm>
      </Widget.Content>
    </Widget>
  );
}

const screenStates = {
  QUIZ: 'QUIZ',
  LOADING: 'LOADING',
  RESULT: 'RESULT',
};

export default function QuizPage() {
  const router = useRouter();
  const { name } = router.query;
  const [screenState, setScreenState] = React.useState(screenStates.LOADING);
  const [results, setResults] = React.useState([]);
  const totalQuestions = db.questions.length;
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const questionIndex = currentQuestion;
  const question = db.questions[questionIndex];

  function addResults(result) {
    setResults([
      ...results,
      result,
    ]);
  }

  // [React chama de: Efeitos || Efects]
  // nasce === didMount
  // atualizado === willUpdate
  // morre === willUnmount

  React.useEffect(() => {
    setTimeout(() => {
      setScreenState(screenStates.QUIZ);
    }, 3 * 1000);
  }, []);

  function handleSubmitQuiz() {
    const nextQuestion = questionIndex + 1;
    if (nextQuestion < totalQuestions) {
      setCurrentQuestion(nextQuestion);
    } else {
      setScreenState(screenStates.RESULT);
    }
  }

  return (
    <QuizBackground backgroundImage={db.bg}>
      <Head>
        <title>{db.title}</title>
        <meta property="og:image" content={db.bg} />
        <meta property="og:title" content="Quiz sobre Pneus" />
      </Head>
      <QuizContainer>
        <Link href="/">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <QuizLogo />
          </a>
        </Link>
        {screenState === screenStates.QUIZ && (
          <QuestionWidget
            question={question}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            onSubmit={handleSubmitQuiz}
            addResults={addResults}
          />
        )}
        {screenState === screenStates.LOADING && <LoadingWidget />}
        {screenState === screenStates.RESULT && <ResultWidget name={name} results={results} />}
      </QuizContainer>
    </QuizBackground>
  );
}
