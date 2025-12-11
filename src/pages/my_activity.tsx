import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { getFlashcardDeckSessionsByUserId } from "../lib/flashcards";

const MyActivity = () => {

    const { supabase } = useOutletContext<any>();

    useEffect(() => {
        getFlashcardDeckSessionsByUserId(supabase)
        .then((res) => {
            console.log(res)
        })
        .catch((err) => {
            console.error(err)
        })

    }, [supabase])

    return (
        <div>
            
        </div>
    );
};

export default MyActivity;