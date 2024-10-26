const Question = ({ name, description, topics, leetcode_link, difficulty}) => {
    // todo: add styles
    return (
        <div>
            <h2>{name}</h2>
            <ul style={styles.topicList}>
                    {topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                    ))}
            </ul>
            <p>Difficulty: {difficulty}</p>
            <p>{description}</p>
        </div>
    )
}