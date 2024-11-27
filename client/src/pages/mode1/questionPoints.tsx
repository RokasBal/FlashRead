import { useEffect, useState } from "react";
import BulletPoints from "../../components/bulletPoint";
import '../../boards/css/mode1.css';

export interface question {
    question: string;
    variants: string[];
    correctVariant?: number;
    selectedVariant?: number;
}

const QuestionPoints: React.FC<{
    questions: question[],
    onChanged?: (arg0: number[]) => void,
}> = ({ questions, onChanged }) => {
    const [selections, setSelections] = useState<number[]>(Array(questions ? questions.length : 0).fill(-1));

    useEffect(() => { // reset selections when questions change
        setSelections(Array(questions ? questions.length : 0).fill(-1));
    }, [questions]);

    useEffect(() => {
        if (onChanged) {
            onChanged(selections);
        }
    }, [selections, onChanged]);

    return (
        <>
        {(questions === undefined || questions.length === 0) ? <h1>There are no questions</h1> :
            questions.map((question, index) => 
                <div className="mode1_questionDiv" key={index} id={`mode1_question${index + 1}Div`}>
                    <h1 className="mode1_question" style={
                        (question.correctVariant !== undefined && question.correctVariant !== null)
                        && {color: question.selectedVariant === question.correctVariant ? '#46C36C' : '#D61F34'}
                        || {}
                    }>{question.question}</h1>
                    <BulletPoints 
                        choices={question.variants}
                        correctVariant={question.correctVariant}
                        selectedVariant={question.selectedVariant}
                        onChanged={selected => {
                            const newSelections = selections.slice();
                            newSelections[index] = selected;
                            setSelections(newSelections);
                        }
                    }/>
                </div>
            )
        }
        </>
    );
}

export default QuestionPoints;