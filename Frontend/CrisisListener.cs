using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

[System.Serializable]
public class Shock
{
    public string type;
    public float severity;
    public string description;
}

public class CrisisListener : MonoBehaviour
{
    [SerializeField] private string crisisEngineUrl = "http://localhost:8000/shock";
    [SerializeField] private float pollingInterval = 5.0f;

    private void Start()
    {
        StartCoroutine(PollCrisisEngine());
    }

    private IEnumerator PollCrisisEngine()
    {
        while (true)
        {
            yield return new WaitForSeconds(pollingInterval);
            yield return GetShock();
        }
    }

    private IEnumerator GetShock()
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(crisisEngineUrl))
        {
            // Request and wait for the desired page.
            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.ConnectionError || webRequest.result == UnityWebRequest.Result.ProtocolError)
            {
                Debug.LogError("Error: " + webRequest.error);
            }
            else
            {
                string jsonResponse = webRequest.downloadHandler.text;
                Shock shock = JsonUtility.FromJson<Shock>(jsonResponse);
                
                if (shock != null)
                {
                    HandleShock(shock);
                }
            }
        }
    }

    private void HandleShock(Shock shock)
    {
        Debug.Log($"<color=red>CRISIS ALERT:</color> {shock.type} (Severity: {shock.severity})");
        Debug.Log($"Description: {shock.description}");
        
        // TODO: Trigger actual UI updates here
        // Example: UIManager.Instance.ShowCrisisAlert(shock);
    }
}
