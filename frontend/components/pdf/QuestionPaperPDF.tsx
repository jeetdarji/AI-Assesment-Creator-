import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { GeneratedOutput } from "@/types/output";

interface QuestionPaperPDFProps {
  data: GeneratedOutput;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  centerText: {
    textAlign: "center",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  questionTypeTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  instruction: {
    fontStyle: "italic",
    color: "#555",
    marginBottom: 8,
  },
  questionRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  questionNumber: {
    width: 24,
    fontWeight: "bold",
  },
  questionText: {
    flex: 1,
  },
  difficultyTag: {
    fontSize: 9,
    marginRight: 4,
  },
  marksTag: {
    fontSize: 9,
    color: "#555",
    marginLeft: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginVertical: 8,
  },
  answerKeyTitle: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
});

export default function QuestionPaperPDF({ data }: QuestionPaperPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* School Header */}
        <Text style={styles.schoolName}>{data.schoolName}</Text>
        <Text style={styles.centerText}>Subject: {data.subject}</Text>
        <Text style={styles.centerText}>Class: {data.classGrade}</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text>Time Allowed: {data.timeAllowed}</Text>
          <Text>Maximum Marks: {data.maxMarks}</Text>
        </View>
        <View style={styles.divider} />

        {/* Instructions */}
        <Text style={styles.bold}>
          All questions are compulsory unless stated otherwise.
        </Text>
        <View style={{ marginBottom: 8 }} />

        {/* Student info lines */}
        <Text>Name: _______________________</Text>
        <Text>Roll Number: _________________</Text>
        <Text>Class: {data.classGrade} Section: ________</Text>
        <View style={styles.divider} />

        {/* Sections loop */}
        {data.sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.questionTypeTitle}>
              {section.questions[0]?.type}
            </Text>
            <Text style={styles.instruction}>{section.instruction}</Text>

            {/* Questions loop */}
            {section.questions.map((q) => {
              const isMcq = q.type.toLowerCase().includes("multiple choice") || q.type.toLowerCase() === "mcq" || (q.options && q.options.length > 0);
              const isLongAnswer = q.type.toLowerCase().includes("long answer") || q.type.toLowerCase().includes("essay");

              return (
                <View key={q.number} style={{ marginBottom: 12 }}>
                  <View style={styles.questionRow}>
                    <Text style={styles.questionNumber}>{q.number}.</Text>
                    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>
                      <Text style={styles.difficultyTag}>[{q.difficulty}]</Text>
                      <Text style={styles.questionText}>{q.text}</Text>
                      <View style={{ flexGrow: 1 }} />
                      <Text style={styles.marksTag}>[{q.marks} Marks]</Text>
                    </View>
                  </View>
                  
                  {isMcq && q.options && q.options.length > 0 && (
                    <View style={{ paddingLeft: 24, marginTop: 4 }}>
                      {q.options.map((opt, i) => (
                        <Text key={i} style={{ fontSize: 10, marginVertical: 2 }}>{opt}</Text>
                      ))}
                    </View>
                  )}

                  {isLongAnswer && (
                    <View style={{ paddingLeft: 24, marginTop: 16 }}>
                      {[...Array(6)].map((_, i) => (
                        <View key={i} style={{ borderBottomWidth: 1, borderColor: "#ccc", marginBottom: 20 }} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={{ textAlign: "center", fontWeight: "bold" }}>
          End of Question Paper
        </Text>
        <View style={styles.divider} />

        <View break>
          {/* Answer Key */}
          <Text style={styles.answerKeyTitle}>Answer Key & Explanations:</Text>
          {data.answerKey.map((item) => (
            <View key={item.questionNumber} style={{ marginBottom: 8 }}>
              <View style={styles.answerRow}>
                <Text style={styles.questionNumber}>{item.questionNumber}.</Text>
                <Text style={{ flex: 1, fontWeight: "bold" }}>{item.answer}</Text>
              </View>
              {item.explanation && (
                <View style={{ paddingLeft: 24, opacity: 0.8 }}>
                  <Text style={{ fontStyle: "italic", fontSize: 9 }}>Explanation: {item.explanation}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
