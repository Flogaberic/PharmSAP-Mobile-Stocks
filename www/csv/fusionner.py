import pandas as pd

df1 = pd.read_csv("invent_12_gf.csv", encoding="ISO-8859-1")  
df2 = pd.read_csv("pspdtand_1.csv", encoding="ISO-8859-1")  

df1["ID"] = df1["ID"].astype(str)
df2["ID_produit"] = df2["ID_produit"].astype(str)

df_fusionne = pd.merge(df1, df2, left_on="ID", right_on="ID_produit", how="inner")

df_fusionne.to_csv("fichier_fusionne.csv", index=False, encoding="utf-8")

print("Fusion terminée avec succès ! ✅")




